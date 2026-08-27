import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import {
  fetchFileAtRef,
  fetchPrDiff,
  fetchPrHead,
  type PrHead,
  type PrRef,
  postPrComment,
  pushToken,
  replyToReviewComment,
  resolveThreadForComment,
} from '../review/github'
import { runFixAgent } from './agent'
import { MAX_CONCURRENT_FIXES, MAX_DIFF_CHARS } from './constants'
import { ANCHORED_SYSTEM, generateFix, UNANCHORED_SYSTEM } from './llm'
import type { FixTarget } from './types'
import { buildAgentRequest, buildCommitMessage, buildFixReply, numberedExcerpt } from './utils'
import { clonePrBranch, commitAndPush, openWorkspace, removeWorkspaceDir } from './workspace'

export * from './agent'
export * from './constants'
export * from './types'
export * from './utils'
export * from './workspace'

const logger = createLogger('whiskers-fix')

// One fix run per PR at a time, few overall: mentions are cheap to post,
// clones and agent loops are not. Duplicates (webhook redelivery, mention
// spam) are dropped, not queued.
const inFlight = new Set<string>()

interface AgentPushResult {
  sha: string | null
  summary: string
}

async function deliverReply(ref: PrRef, target: FixTarget, reply: string): Promise<void> {
  if (target.commentId !== null) {
    await replyToReviewComment(ref, target.commentId, reply)
  } else {
    await postPrComment(ref, `@${target.author} ${reply}`)
  }
}

/**
 * The real fix: clone the PR branch, let the sandboxed agent work it with a
 * turn budget, commit and push as the bot. Reply delivery is NOT part of this
 * scope — a failed reply after a successful push must not trigger a fallback.
 */
async function runAgentFix(ref: PrRef, target: FixTarget, head: PrHead): Promise<AgentPushResult> {
  const token = await pushToken(ref.owner, ref.repo)
  const dir = await clonePrBranch(ref, head.branch, token)
  let workspace: Awaited<ReturnType<typeof openWorkspace>>
  try {
    workspace = await openWorkspace(dir)
  } catch (error) {
    await removeWorkspaceDir(dir)
    throw error
  }
  try {
    const outcome = await runFixAgent(workspace, buildAgentRequest(target))
    const sha = await commitAndPush(
      dir,
      head.branch,
      buildCommitMessage(target, whiskersEnvConfig.github.botHandle),
      token,
    )
    logger.info({ ...ref, sha, steps: outcome.steps }, 'agent fix finished')
    return { sha, summary: outcome.summary }
  } finally {
    await workspace.destroy()
    await removeWorkspaceDir(dir)
  }
}

/** Fallback when the branch can't be pushed (fork PR) or the agent run failed. */
async function runSuggestionFix(ref: PrRef, target: FixTarget): Promise<void> {
  const anchored = target.commentId !== null && target.path !== null && target.line !== null

  if (anchored) {
    // SAFETY: `anchored` guarantees path/line/commentId are non-null
    const path = target.path as string
    const line = target.line as number
    const start = target.startLine ?? line
    try {
      // Re-fetch: the head may have moved since the mention (e.g. an agent push).
      const { sha } = await fetchPrHead(ref)
      const excerpt = numberedExcerpt(await fetchFileAtRef(ref, path, sha), start, line)
      const fix = await generateFix(
        ANCHORED_SYSTEM,
        `File: ${path}\nCommented lines: ${start}-${line}\n\nExcerpt:\n${excerpt}\n\nRequest from @${target.author}:\n${target.body}`,
      )
      await replyToReviewComment(ref, target.commentId as number, buildFixReply(fix))
      return
    } catch (error) {
      // e.g. files >1MB aren't served by the contents API — degrade to prose.
      logger.warn(
        { err: error instanceof Error ? error.message : String(error) },
        'anchored suggestion failed — degrading to a diff-based reply',
      )
    }
  }

  const diff = (await fetchPrDiff(ref)).slice(0, MAX_DIFF_CHARS)
  const fix = await generateFix(
    UNANCHORED_SYSTEM,
    `PR diff:\n${diff}\n\nRequest from @${target.author}:\n${target.body}`,
  )
  await deliverReply(ref, target, buildFixReply(fix))
}

/** Mention-to-fix pipeline: push a real commit when possible, suggest otherwise. */
export async function runFix(ref: PrRef, target: FixTarget): Promise<void> {
  const key = `${ref.owner}/${ref.repo}#${ref.prNumber}`
  if (inFlight.has(key)) {
    logger.warn({ ...ref }, 'fix already in flight for this PR — dropping mention')
    return
  }
  if (inFlight.size >= MAX_CONCURRENT_FIXES) {
    logger.warn(
      { ...ref, inFlight: inFlight.size },
      'fix concurrency cap reached — dropping mention',
    )
    return
  }
  inFlight.add(key)
  try {
    const head = await fetchPrHead(ref)
    let pushed: AgentPushResult | null = null
    if (head.sameRepo) {
      try {
        pushed = await runAgentFix(ref, target, head)
      } catch (error) {
        logger.warn(
          { err: error instanceof Error ? error.message : String(error) },
          'agent fix failed — falling back to a suggestion reply',
        )
      }
    }
    if (pushed) {
      const reply = pushed.sha
        ? `Pushed ${pushed.sha.slice(0, 7)} to \`${head.branch}\`.\n\n${pushed.summary}`
        : pushed.summary || 'I looked into it but found no change to make.'
      // The work is done; a failed reply must not re-run anything.
      await deliverReply(ref, target, reply).catch((error) => {
        logger.error(
          { err: error instanceof Error ? error.message : String(error) },
          'fix reply delivery failed',
        )
      })
      // A pushed fix closes the thread it was asked on; prose-only outcomes stay open.
      if (pushed.sha && target.commentId !== null) {
        await resolveThreadForComment(ref, target.commentId).catch((error) => {
          logger.warn(
            { err: error instanceof Error ? error.message : String(error) },
            'thread resolve failed',
          )
        })
      }
      return
    }
    await runSuggestionFix(ref, target)
  } finally {
    inFlight.delete(key)
  }
}
