import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { Review } from '@code-whiskers/whiskers-domain'
import { completeReview, createFindings, createReview } from '../mutations'
import { countReviews, getPreviousReview } from '../queries'
import { mapWithConcurrency } from '../shared/llm'
import { chunkDiff, commentableLines } from './chunk'
import { buildPrContext } from './context'
import {
  completeCheckRun,
  fetchPrConversation,
  fetchPrDiff,
  fetchPrHead,
  type PrRef,
  postPrComment,
  postPrReview,
  startCheckRun,
} from './github'
import { mergeReviews, reviewChunk } from './llm'

export * from './chunk'
export * from './github'
export * from './llm'

const logger = createLogger('whiskers-review')

// A malformed sample counts as transient too: cheap models emit unparseable JSON
// a few percent of the time, and a fresh sample almost always parses.
const TRANSIENT_ERROR =
  /timed out|timeout|abort|429|5\d\d|overloaded|rate limit|no object generated|could not parse|did not match schema/i
const RETRY_DELAY_MS = 2_000
// A failed review must be visible on the PR, but only once per head —
// webhook redeliveries and repeated failures must not pile up comments.
const failureNotified = new Set<string>()
const FAILURE_NOTIFIED_CAP = 1_000

/**
 * One retry per chunk, transient failures only (timeouts, rate limits,
 * provider 5xx, a malformed sample) with a short pause — a 4xx would just fail
 * again, and the original error stays visible in the log.
 */
async function reviewChunkWithRetry(
  chunk: string,
  context: string,
): ReturnType<typeof reviewChunk> {
  try {
    return await reviewChunk(chunk, context)
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    if (!TRANSIENT_ERROR.test(message)) throw error
    logger.warn({ err: message }, 'transient chunk failure — retrying once')
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    return reviewChunk(chunk, context)
  }
}

/** The whole pipeline: diff -> chunks -> LLM -> persist -> PR review on GitHub. */
export async function runReview(ref: PrRef): Promise<Review | undefined> {
  const head = await fetchPrHead(ref)
  const headSha = head.sha
  const review = await createReview({
    owner: ref.owner,
    repo: ref.repo,
    prNumber: ref.prNumber,
    headSha,
    title: head.title,
    author: head.author,
    additions: head.additions,
    deletions: head.deletions,
    status: 'running',
    model: whiskersEnvConfig.openrouter.model,
  })
  if (!review) return undefined
  logger.info({ ...ref, headSha, reviewId: review.id }, 'review started')
  // The visible face in the PR's checks section — App auth only, null under PAT.
  const checkRunId = await startCheckRun(ref, headSha).catch(() => null)

  try {
    const [diff, conversation, previous, reviewCount] = await Promise.all([
      fetchPrDiff(ref),
      fetchPrConversation(ref).catch(() => ({ verdicts: [], discussion: [], inline: [] })),
      getPreviousReview(ref.owner, ref.repo, ref.prNumber, review.createdAt),
      countReviews(ref.owner, ref.repo, ref.prNumber, review.createdAt),
    ])

    const context = buildPrContext({
      reviewCount,
      previous: previous && {
        headSha: previous.review.headSha,
        verdict: previous.review.verdict,
        findings: previous.findings,
      },
      conversation,
      botHandle: whiskersEnvConfig.github.botHandle,
    })
    if (context) logger.info({ ...ref, contextChars: context.length }, 'review has prior context')

    const chunks = chunkDiff(diff)
    const results = await mapWithConcurrency(chunks, (chunk) =>
      reviewChunkWithRetry(chunk, context),
    )
    const merged = mergeReviews(results)

    await createFindings(
      merged.findings.map((f) => ({
        reviewId: review.id,
        file: f.file,
        line: f.line,
        severity: f.severity,
        category: f.category,
        title: f.title,
        body: f.body,
        suggestion: f.suggestion,
      })),
    )
    await postPrReview(ref, headSha, merged, commentableLines(diff))
    await completeCheckRun(ref, checkRunId, { review: merged }).catch((error) => {
      logger.warn(
        { err: error instanceof Error ? error.message : String(error) },
        'check run update failed',
      )
    })
    logger.info(
      { ...ref, reviewId: review.id, verdict: merged.verdict, findings: merged.findings.length },
      'review completed',
    )
    return await completeReview(review.id, {
      status: 'completed',
      verdict: merged.verdict,
      summary: merged.summary,
      model: review.model,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error({ err: message }, 'review failed')
    await completeCheckRun(ref, checkRunId, { error: message }).catch(() => {})
    const failureKey = `${ref.owner}/${ref.repo}#${ref.prNumber}@${headSha}`
    if (!failureNotified.has(failureKey)) {
      if (failureNotified.size >= FAILURE_NOTIFIED_CAP) failureNotified.clear()
      failureNotified.add(failureKey)
      await postPrComment(
        ref,
        `⚠️ **code-whiskers review failed** on \`${headSha.slice(0, 7)}\`\n\n> ${message.slice(0, 500)}\n\nThis is usually a transient provider error — push a new commit to trigger another review.`,
      ).catch((commentError) => {
        logger.warn(
          {
            err: commentError instanceof Error ? commentError.message : String(commentError),
          },
          'failure comment delivery failed',
        )
      })
    }
    return await completeReview(review.id, {
      status: 'failed',
      verdict: null,
      summary: error instanceof Error ? error.message : String(error),
      model: review.model,
    })
  }
}
