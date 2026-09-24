import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { Review } from '@code-whiskers/whiskers-domain'
import { completeReview, createFindings, createReview } from '../mutations'
import { countReviews, getPreviousReview } from '../queries'
import { createTokenTally, mapWithConcurrency } from '../shared/llm'
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
import { resolveOutcome, reviewChunkWithRetry } from './outcome'
import { type ReviewReport, renderFailureComment } from './render'
import { buildRulesContext, fetchRules } from './rules'
import { fetchSuppressions } from './suppressions'
import { isRepositoryWatched } from './watching'

export * from './chunk'
export * from './github'
export * from './llm'
export * from './render'
export * from './rules'
export * from './suppressions'
export * from './watching'

const logger = createLogger('whiskers-review')

// A failed review must be visible on the PR, but only once per head —
// webhook redeliveries and repeated failures must not pile up comments.
const failureNotified = new Set<string>()
const FAILURE_NOTIFIED_CAP = 1_000

/** The whole pipeline: diff -> chunks -> LLM -> persist -> PR review on GitHub. */
export async function runReview(ref: PrRef): Promise<Review | undefined> {
  if (!(await isRepositoryWatched(`${ref.owner}/${ref.repo}`))) {
    logger.info(ref, 'repository is paused in CodeWhiskers — review skipped')
    return undefined
  }
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
  const tokens = createTokenTally()

  try {
    const [diff, conversation, previous, reviewCount, suppressions, rules] = await Promise.all([
      fetchPrDiff(ref),
      fetchPrConversation(ref).catch(() => ({ verdicts: [], discussion: [], inline: [] })),
      getPreviousReview(ref.owner, ref.repo, ref.prNumber, review.createdAt),
      countReviews(ref.owner, ref.repo, ref.prNumber, review.createdAt),
      fetchSuppressions(`${ref.owner}/${ref.repo}`),
      fetchRules(`${ref.owner}/${ref.repo}`),
    ])

    const prContext = buildPrContext({
      reviewCount,
      previous: previous && {
        headSha: previous.review.headSha,
        verdict: previous.review.verdict,
        findings: previous.findings,
      },
      conversation,
      suppressions,
      botHandle: whiskersEnvConfig.github.botHandle,
    })
    const context = [buildRulesContext(rules), prContext].filter(Boolean).join('\n\n')
    if (context) {
      logger.info(
        { ...ref, contextChars: context.length, rules: rules.length },
        'review has context',
      )
    }

    const chunks = chunkDiff(diff)
    const outcomes = await mapWithConcurrency(chunks, (chunk) =>
      reviewChunkWithRetry(chunk, context, tokens),
    )
    const { review: merged, coverage } = resolveOutcome(outcomes)
    if (coverage.reviewed < coverage.total) logger.warn({ ...ref, ...coverage }, 'partial review')
    const report: ReviewReport = {
      review: merged,
      model: review.model ?? whiskersEnvConfig.openrouter.model,
      coverage,
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
    await postPrReview(ref, headSha, report, commentableLines(diff))
    await completeCheckRun(ref, headSha, checkRunId, { report }).catch((error) => {
      logger.warn(
        { err: error instanceof Error ? error.message : String(error) },
        'check run update failed',
      )
    })
    logger.info(
      {
        ...ref,
        reviewId: review.id,
        verdict: merged.verdict,
        findings: merged.findings.length,
        chunks: chunks.length,
        tokens,
      },
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
    logger.error({ err: message, tokens }, 'review failed')
    await completeCheckRun(ref, headSha, checkRunId, { error: message }).catch(() => {})
    const failureKey = `${ref.owner}/${ref.repo}#${ref.prNumber}@${headSha}`
    if (!failureNotified.has(failureKey)) {
      if (failureNotified.size >= FAILURE_NOTIFIED_CAP) failureNotified.clear()
      failureNotified.add(failureKey)
      await postPrComment(ref, renderFailureComment(headSha, message)).catch((commentError) => {
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
