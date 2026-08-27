import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { Review } from '@code-whiskers/whiskers-domain'
import { completeReview, createFindings, createReview } from '../mutations'
import { chunkDiff, commentableLines } from './chunk'
import {
  completeCheckRun,
  fetchPrDiff,
  fetchPrHeadSha,
  type PrRef,
  postPrComment,
  postPrReview,
  startCheckRun,
} from './github'
import { filterBySeverity, mergeReviews, resolveVerdict, reviewChunk } from './llm'

export * from './chunk'
export * from './github'
export * from './llm'

const logger = createLogger('whiskers-review')

const TRANSIENT_ERROR = /timed out|timeout|abort|429|5\d\d|overloaded|rate limit/i
const RETRY_DELAY_MS = 2_000
// A failed review must be visible on the PR, but only once per head —
// webhook redeliveries and repeated failures must not pile up comments.
const failureNotified = new Set<string>()
const FAILURE_NOTIFIED_CAP = 1_000

/**
 * One retry per chunk, transient failures only (timeouts, rate limits,
 * provider 5xx) with a short pause — a 4xx would just fail again, and the
 * original error stays visible in the log.
 */
async function reviewChunkWithRetry(chunk: string): Promise<ReturnType<typeof reviewChunk>> {
  try {
    return await reviewChunk(chunk)
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    if (!TRANSIENT_ERROR.test(message)) throw error
    logger.warn({ err: message }, 'transient chunk failure — retrying once')
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    return reviewChunk(chunk)
  }
}

/** The whole pipeline: diff -> chunks -> LLM -> persist -> PR review on GitHub. */
export async function runReview(ref: PrRef): Promise<Review | undefined> {
  const headSha = await fetchPrHeadSha(ref)
  const review = await createReview({
    owner: ref.owner,
    repo: ref.repo,
    prNumber: ref.prNumber,
    headSha,
    status: 'running',
    model: whiskersEnvConfig.openrouter.model,
  })
  if (!review) return undefined
  logger.info({ ...ref, headSha, reviewId: review.id }, 'review started')
  // The visible face in the PR's checks section — App auth only, null under PAT.
  const checkRunId = await startCheckRun(ref, headSha).catch(() => null)

  try {
    const diff = await fetchPrDiff(ref)
    const chunks = chunkDiff(diff)
    const results = await Promise.all(chunks.map(reviewChunkWithRetry))
    const raw = mergeReviews(results)
    // The pickiness floor: drop sub-threshold findings, then re-derive the
    // verdict so it always matches what is actually posted.
    const findings = filterBySeverity(raw.findings, whiskersEnvConfig.review.minSeverity)
    const merged = { ...raw, findings, verdict: resolveVerdict(findings) }

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
