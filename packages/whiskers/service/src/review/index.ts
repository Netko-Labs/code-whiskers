import { createLogger } from '@code-whiskers/logger'
import { reportError } from '@code-whiskers/observability/server'
import type { Review } from '@code-whiskers/whiskers-domain'
import { completeReview, createReview } from '../mutations'
import { getReviewRound, hasReviewOfHead } from '../queries'
import { createTokenTally } from '../shared/llm'
import { publishMergeBrief } from './brief-publish'
import { completeCheckRun } from './check-run'
import { fetchPrHead, type PrHead, type PrRef, postPrComment, startCheckRun } from './github'
import { contractOfRound, learnFromFixed, resolveFixedThreads } from './loop'
import { runPipeline } from './pipeline'
import { reviewProvider } from './providers'
import { renderFailureComment } from './render'
import { RETRY_DELAYS_MS, retryDelayFor } from './retry'
import type { PipelineAttempt, ReviewUsage, RunReviewOptions } from './types'
import { isRepositoryWatched } from './watching'

export * from './agent-reply'
export type { MergeBrief } from './brief'
export * from './brief-publish'
export * from './check-run'
export * from './chunk'
export * from './conventions'
export * from './github'
export * from './grounding'
export * from './llm'
export * from './loop'
export * from './memory'
export * from './production'
export * from './prompt'
export * from './providers'
export * from './readiness'
export * from './render'
export * from './retry'
export * from './settle'
export * from './suppressions'
export * from './threads'
export type { CiState, HumanReason, LoopReadiness } from './types'
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
    headRef: head.branch,
    title: head.title,
    author: head.author,
    additions: head.additions,
    deletions: head.deletions,
    status: 'running',
    model: (await reviewProvider()).model,
    round: await getReviewRound(ref.owner, ref.repo, ref.prNumber),
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
      const { report, merged, deltaFrom, loop, memoryApplied } = await runPipeline(
        ref,
        head,
        review,
        tokens,
        progress,
        options,
      )
      const contract = contractOfRound(ref, headSha, loop)
      await completeCheckRun(ref, headSha, checkRunId, { report, contract }).catch((error) => {
        logger.warn({ err: messageOf(error) }, 'check run update failed')
      })
      await resolveFixedThreads(ref, headSha, loop.fixed)
      learnFromFixed(ref, headSha, loop.fixed)
      const completed = await completeReview(review.id, {
        status: 'completed',
        verdict: merged.verdict,
        loopVerdict: loop.verdict,
        fixedSinceLastRound: loop.fixedFingerprints,
        memoryApplied,
        summary: merged.summary,
        diffScope: deltaFrom ? 'delta' : 'full',
        deltaFrom,
        ...usage(),
      })
      // Off the retry path: a brief that cannot post never re-runs a completed review.
      if (loop.verdict === 'mergeable' || loop.verdict === 'needs_human') {
        void publishMergeBrief(ref).catch((error: unknown) => {
          logger.warn({ ...ref, err: messageOf(error) }, 'merge brief not posted')
        })
      }
      return completed
    } catch (error) {
      const delay = retryDelayFor(error, attempt)
      if (delay !== undefined) {
        logger.warn(
          { ...ref, headSha, attempt: attempt + 1, retryInMs: delay, err: messageOf(error) },
          'review attempt failed — retrying',
        )
        await sleep(delay)
        continue
      }
      reportError(error, { tags: { task: 'review', repo: `${ref.owner}/${ref.repo}` } })
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
