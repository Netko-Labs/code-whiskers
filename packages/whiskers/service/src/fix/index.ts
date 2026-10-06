import { createLogger } from '@code-whiskers/logger'
import {
  fetchFileAtRef,
  fetchPrDiff,
  fetchPrHead,
  type PrRef,
  postPrComment,
  replyToReviewComment,
} from '../review/github'
import { MAX_CONCURRENT_FIXES, MAX_DIFF_CHARS } from './constants'
import { ANCHORED_SYSTEM, generateFix, UNANCHORED_SYSTEM } from './llm'
import type { FixTarget } from './types'
import { buildFixReply, clampBody, isProtectedPath, numberedExcerpt } from './utils'

export * from './constants'
export * from './types'
export * from './utils'

const logger = createLogger('whiskers-fix')

// One fix run per PR at a time, few overall: mentions are cheap to post,
// model calls are not. Duplicates (webhook redelivery, mention
// spam) are dropped, not queued. Per-process state — the deployment runs a
// single replica; scaling out needs a shared lock (e.g. Postgres advisory).
const inFlight = new Set<string>()

async function deliverReply(ref: PrRef, target: FixTarget, reply: string): Promise<void> {
  if (target.commentId !== null) {
    await replyToReviewComment(ref, target.commentId, reply)
  } else {
    await postPrComment(ref, `@${target.author} ${reply}`)
  }
}

/** The bot is read-only: a fix is a committable suggestion on the thread, or prose over the diff. */
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
        `File: ${path}\nCommented lines: ${start}-${line}\n\nExcerpt:\n${excerpt}\n\nRequest from @${target.author}:\n${clampBody(target.body)}`,
      )
      // A one-click-committable suggestion must honor the same denylist as
      // the push path — protected paths get prose, never a suggestion fence.
      const reply = isProtectedPath(path) ? fix.explanation : buildFixReply(fix)
      await replyToReviewComment(ref, target.commentId as number, reply)
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
    `PR diff:\n${diff}\n\nRequest from @${target.author}:\n${clampBody(target.body)}`,
  )
  await deliverReply(ref, target, buildFixReply(fix))
}

/** Mention-to-fix pipeline: one suggestion reply per PR at a time. */
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
    // A capacity drop is a legitimate request, not spam — say so.
    await deliverReply(
      ref,
      target,
      'I am at capacity right now — mention me again in a few minutes.',
    ).catch(() => {})
    return
  }
  inFlight.add(key)
  try {
    const head = await fetchPrHead(ref)
    if (head.state !== 'open') {
      logger.warn({ ...ref, state: head.state }, 'fix requested on a non-open PR — skipping')
      await deliverReply(
        ref,
        target,
        'This pull request is no longer open, so there is nothing to fix here.',
      ).catch(() => {})
      return
    }
    await runSuggestionFix(ref, target)
  } finally {
    inFlight.delete(key)
  }
}
