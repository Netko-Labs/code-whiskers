import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { Review } from '@code-whiskers/whiskers-domain'
import { completeReview, createReview } from '../mutations'
import { hasReviewOfHead } from '../queries'
import { createTokenTally } from '../shared/llm'
import {
  completeCheckRun,
  fetchPrHead,
  type PrHead,
  type PrRef,
  postPrComment,
  startCheckRun,
} from './github'
import { runPipeline } from './pipeline'
import { renderFailureComment } from './render'
import { isTransient, RETRY_DELAYS_MS } from './retry'
import type { PipelineAttempt, ReviewUsage, RunReviewOptions } from './types'
import { isRepositoryWatched } from './watching'

export * from './chunk'
export * from './conventions'
export * from './github'
export * from './grounding'
export * from './llm'
export * from './render'
export * from './retry'
export * from './rules'
export * from './settle'
export * from './suppressions'
export * from './threads'
export * from './watching'

const logger = createLogger('whiskers-review')

// A failed review must be visible on the PR, but only once per head —
// webhook redeliveries and repeated failures must not pile up comments.
const failureNotified = new Set<string>()
const FAILURE_NOTIFIED_CAP = 1_000
// GitHub delivers opened/reopened/ready_for_review (and redeliveries) for one head; one review each.
const inFlight = new Set<string>()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** The whole pipeline: diff -> chunks -> LLM -> settle against history -> PR review on GitHub. */
export async function runReview(
  ref: PrRef,
  options: RunReviewOptions = {},
): Promise<Review | undefined> {
  if (!(await isRepositoryWatched(`${ref.owner}/${ref.repo}`))) {
    logger.info(ref, 'repository is paused in CodeWhiskers — review skipped')
    return undefined
  }
  const head = await fetchPrHead(ref)
  const headKey = `${ref.owner}/${ref.repo}#${ref.prNumber}@${head.sha}`
  if (inFlight.has(headKey)) {
    logger.info({ ...ref, headSha: head.sha }, 'this head is already being reviewed — skipped')
    return undefined
  }
  inFlight.add(headKey)
  try {
    const isReviewed = await hasReviewOfHead(ref.owner, ref.repo, ref.prNumber, head.sha)
    if (isReviewed && !options.force) {
      logger.info({ ...ref, headSha: head.sha }, 'this head was already reviewed — skipped')
      return undefined
    }
    return await reviewHead(ref, head, options)
  } finally {
    inFlight.delete(headKey)
  }
}

/** One review row per head; retries stay inside it so a transient failure never reads as one. */
async function reviewHead(
  ref: PrRef,
  head: PrHead,
  options: RunReviewOptions,
): Promise<Review | undefined> {
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
  const usage = (): ReviewUsage => ({
    model: review.model,
    inputTokens: tokens.input,
    outputTokens: tokens.output,
    reasoningTokens: tokens.reasoning,
  })

  const progress: PipelineAttempt = { isPosted: false }
  for (let attempt = 0; ; attempt += 1) {
    try {
      const { report, merged } = await runPipeline(ref, head, review, tokens, progress, options)
      await completeCheckRun(ref, headSha, checkRunId, { report }).catch((error) => {
        logger.warn({ err: messageOf(error) }, 'check run update failed')
      })
      return await completeReview(review.id, {
        status: 'completed',
        verdict: merged.verdict,
        summary: merged.summary,
        ...usage(),
      })
    } catch (error) {
      const delay = RETRY_DELAYS_MS[attempt]
      if (delay !== undefined && isTransient(error)) {
        logger.warn(
          { ...ref, headSha, attempt: attempt + 1, retryInMs: delay, err: messageOf(error) },
          'review attempt failed — retrying',
        )
        await sleep(delay)
        continue
      }
      return await failReview(ref, headSha, review, checkRunId, messageOf(error), usage())
    }
  }
}

async function failReview(
  ref: PrRef,
  headSha: string,
  review: Review,
  checkRunId: number | null,
  message: string,
  usage: ReviewUsage,
): Promise<Review | undefined> {
  logger.error(
    { ...ref, headSha, err: message, attempts: RETRY_DELAYS_MS.length + 1 },
    'review failed',
  )
  await completeCheckRun(ref, headSha, checkRunId, { error: message }).catch(() => {})
  const failureKey = `${ref.owner}/${ref.repo}#${ref.prNumber}@${headSha}`
  if (!failureNotified.has(failureKey)) {
    if (failureNotified.size >= FAILURE_NOTIFIED_CAP) failureNotified.clear()
    failureNotified.add(failureKey)
    await postPrComment(ref, renderFailureComment(headSha, message)).catch((error) => {
      logger.warn({ err: messageOf(error) }, 'failure comment delivery failed')
    })
  }
  return await completeReview(review.id, {
    status: 'failed',
    verdict: null,
    summary: message,
    ...usage,
  })
}
