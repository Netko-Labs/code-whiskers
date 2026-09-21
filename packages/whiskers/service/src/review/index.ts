import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { LlmReview, Review } from '@code-whiskers/whiskers-domain'
import { completeReview, createFindings, createReview } from '../mutations'
import { countReviews, getPreviousReview } from '../queries'
import { mapWithConcurrency } from '../shared/llm'
import { chunkDiff, commentableLines, splitChunk } from './chunk'
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
// A timeout says the prompt was too big for the window, not that the provider is
// unwell — the same chunk will time out again, so that retry splits instead.
const TIMEOUT_ERROR = /timed out|timeout|abort/i
const MAX_ATTEMPTS = 3
const RETRY_BASE_MS = 1_500
// Halving twice turns one 24k chunk into four; past that the timeout is not size.
const MAX_SPLIT_DEPTH = 2

/** Full jitter — four chunks retrying in lockstep would re-create the congestion. */
function backoffMs(attempt: number): number {
  const ceiling = RETRY_BASE_MS * 2 ** (attempt - 1)
  return Math.round(ceiling * (0.5 + Math.random() * 0.5))
}
// A failed review must be visible on the PR, but only once per head —
// webhook redeliveries and repeated failures must not pile up comments.
const failureNotified = new Set<string>()
const FAILURE_NOTIFIED_CAP = 1_000

/**
 * Up to three attempts per chunk with jittered backoff. A chunk that still
 * fails resolves to `null` rather than throwing: one unlucky section must not
 * discard the findings from every other one.
 */
async function reviewChunkWithRetry(
  chunk: string,
  context: string,
  depth = 0,
): Promise<LlmReview | null> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await reviewChunk(chunk, context)
    } catch (error) {
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
      const last = attempt === MAX_ATTEMPTS
      if (!TRANSIENT_ERROR.test(message) || last) {
        logger.warn({ err: message, attempt }, 'chunk failed — skipping this section')
        return null
      }

      if (TIMEOUT_ERROR.test(message) && depth < MAX_SPLIT_DEPTH) {
        const halves = splitChunk(chunk)
        if (halves.length > 1) {
          logger.warn({ attempt, depth, chars: chunk.length }, 'chunk timed out — splitting')
          const results = await Promise.all(
            halves.map((half) => reviewChunkWithRetry(half, context, depth + 1)),
          )
          const usable = results.filter((r): r is LlmReview => r !== null)
          return usable.length > 0 ? mergeReviews(usable) : null
        }
      }

      await new Promise((resolve) => setTimeout(resolve, backoffMs(attempt)))
      logger.warn({ err: message, attempt }, 'transient chunk failure — retrying')
    }
  }
  return null
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
    const reviewed = results.filter((r): r is LlmReview => r !== null)
    const skipped = results.length - reviewed.length

    // Every section failing is a real failure; some failing is a partial review,
    // and a partial review beats telling the author to push again for nothing.
    if (reviewed.length === 0) {
      throw new Error(`all ${results.length} diff sections failed to review`)
    }

    const merged = mergeReviews(reviewed)
    if (skipped > 0) {
      logger.warn({ ...ref, skipped, total: results.length }, 'partial review')
      const note = `_${skipped} of ${results.length} sections could not be reviewed (provider timed out); everything below covers the rest._`
      merged.summary = merged.summary ? `${merged.summary}\n\n${note}` : note
    }

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
