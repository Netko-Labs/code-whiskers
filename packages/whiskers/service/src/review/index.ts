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
  postPrReview,
  startCheckRun,
} from './github'
import { mergeReviews, reviewChunk } from './llm'

export * from './chunk'
export * from './github'
export * from './llm'

const logger = createLogger('whiskers-review')

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
    const results = await Promise.all(chunks.map((chunk) => reviewChunk(chunk)))
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
    return await completeReview(review.id, {
      status: 'failed',
      verdict: null,
      summary: error instanceof Error ? error.message : String(error),
      model: review.model,
    })
  }
}
