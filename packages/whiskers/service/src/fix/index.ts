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
} from '../review/github'
import { runFixAgent } from './agent'
import { ANCHORED_SYSTEM, generateFix, UNANCHORED_SYSTEM } from './llm'
import type { FixTarget } from './types'
import { buildAgentRequest, buildCommitMessage, buildFixReply, numberedExcerpt } from './utils'
import { clonePrBranch, commitAndPush, openWorkspace, removeWorkspaceDir } from './workspace'

export * from './agent'
export * from './types'
export * from './utils'
export * from './workspace'

const logger = createLogger('whiskers-fix')

const MAX_DIFF_CHARS = 60_000

async function deliverReply(ref: PrRef, target: FixTarget, reply: string): Promise<void> {
  if (target.commentId !== null) {
    await replyToReviewComment(ref, target.commentId, reply)
  } else {
    await postPrComment(ref, `@${target.author} ${reply}`)
  }
}

/**
 * The real fix: clone the PR branch, let the sandboxed agent work it with a
 * turn budget, commit and push as the bot, and report the commit on the thread.
 */
async function runAgentFix(ref: PrRef, target: FixTarget, head: PrHead): Promise<void> {
  const token = await pushToken(ref.owner, ref.repo)
  const dir = await clonePrBranch(ref, head.branch, token)
  const workspace = await openWorkspace(dir)
  try {
    const outcome = await runFixAgent(workspace, buildAgentRequest(target))
    const sha = await commitAndPush(
      dir,
      head.branch,
      buildCommitMessage(target, whiskersEnvConfig.github.botHandle),
      token,
    )
    logger.info({ ...ref, sha, steps: outcome.steps }, 'agent fix finished')
    const reply = sha
      ? `Pushed ${sha.slice(0, 7)} to \`${head.branch}\`.\n\n${outcome.summary}`
      : outcome.summary || 'I looked into it but found no change to make.'
    await deliverReply(ref, target, reply)
  } finally {
    await workspace.destroy()
    await removeWorkspaceDir(dir)
  }
}

/** Fallback when the branch can't be pushed (fork PR) or the agent run failed. */
async function runSuggestionFix(ref: PrRef, target: FixTarget, headSha: string): Promise<void> {
  const anchored = target.commentId !== null && target.path !== null && target.line !== null

  if (anchored) {
    // SAFETY: `anchored` guarantees path/line/commentId are non-null
    const path = target.path as string
    const line = target.line as number
    const start = target.startLine ?? line
    const excerpt = numberedExcerpt(await fetchFileAtRef(ref, path, headSha), start, line)
    const fix = await generateFix(
      ANCHORED_SYSTEM,
      `File: ${path}\nCommented lines: ${start}-${line}\n\nExcerpt:\n${excerpt}\n\nRequest from @${target.author}:\n${target.body}`,
    )
    await replyToReviewComment(ref, target.commentId as number, buildFixReply(fix))
    return
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
  const head = await fetchPrHead(ref)
  if (head.sameRepo) {
    try {
      await runAgentFix(ref, target, head)
      return
    } catch (error) {
      logger.warn(
        { err: error instanceof Error ? error.message : String(error) },
        'agent fix failed — falling back to a suggestion reply',
      )
    }
  }
  await runSuggestionFix(ref, target, head.sha)
}
