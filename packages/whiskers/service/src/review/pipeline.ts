import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { Review } from '@code-whiskers/whiskers-domain'
import { clearFindings, createFindings } from '../mutations'
import { countReviews, getPreviousReview, getRepositoryIssues } from '../queries'
import type { TokenTally } from '../shared/llm'
import { chunkDiff, commentableLines } from './chunk'
import { withoutDisprovedCompileClaims } from './ci'
import { buildPrContext } from './context'
import { buildConventionsContext, fetchConventions } from './conventions'
import {
  buildDeltaNote,
  buildDescriptionContext,
  fetchDeltaDiff,
  isPartialSummary,
  partialSummary,
} from './delta'
import { fetchPrConversation, fetchPrDiff, type PrHead, type PrRef, postPrReview } from './github'
import { buildFileManifest } from './grounding'
import { closeRound, findingRows, linkPostedThreads, withThreadUrls } from './loop'
import { buildMemoryContext, fetchMemory, markMemoryUsed, memoryForFiles } from './memory'
import { resolveOutcome, reviewChunks } from './outcome'
import { buildProductionContext, productionSignals } from './production'
import { reviewProvider } from './providers'
import type { ReviewReport } from './render'
import { dismissStaleBlocks, hasStandingApproval, isStillHead } from './review-state'
import { reviewVerdict, settleFindings, suppressedFindings } from './settle'
import { fetchSuppressions } from './suppressions'
import { fetchBotThreads } from './threads'
import type { PipelineAttempt, PipelineResult, PriorThread, RunReviewOptions } from './types'

const logger = createLogger('whiskers-review')

function warnWithout<T>(what: string, fallback: T) {
  return (error: unknown): T => {
    logger.warn(
      { err: error instanceof Error ? error.message : String(error) },
      `${what} unavailable`,
    )
    return fallback
  }
}

/**
 * One attempt: gather what the PR and the repo say, review the diff chunk by chunk, settle the
 * findings against what humans already answered, persist, and post what is new to GitHub.
 */
export async function runPipeline(
  ref: PrRef,
  head: PrHead,
  review: Review,
  tokens: TokenTally,
  attempt: PipelineAttempt,
  options: RunReviewOptions,
): Promise<PipelineResult> {
  const headSha = head.sha
  const slug = `${ref.owner}/${ref.repo}`
  const botHandle = whiskersEnvConfig.github.botHandle
  const [diff, conversation, previous, reviewCount, suppressions, threads] = await Promise.all([
    fetchPrDiff(ref),
    fetchPrConversation(ref).catch(
      warnWithout('conversation', { verdicts: [], discussion: [], inline: [] }),
    ),
    getPreviousReview(ref.owner, ref.repo, ref.prNumber, review.createdAt),
    countReviews(ref.owner, ref.repo, ref.prNumber, review.createdAt),
    fetchSuppressions(slug),
    fetchBotThreads(ref, botHandle).catch(warnWithout('review threads', null)),
  ])
  // Without the threads, the last review's findings stand in as unanswered ones: nothing already
  // posted goes out again, and nothing a human settled is revived as fresh.
  const priorThreads: PriorThread[] =
    threads ??
    (previous?.findings ?? []).map((f) => ({
      path: f.file,
      line: f.line,
      title: f.title,
      severity: f.severity,
      isResolved: false,
      isOutdated: false,
      isDownvoted: false,
      replies: [],
    }))
  // A push after a review is reviewed for what it changes; a forced re-review reads it all.
  const deltaFrom =
    !options.force &&
    previous &&
    previous.review.headSha !== headSha &&
    !isPartialSummary(previous.review.summary)
      ? previous.review.headSha
      : null
  const delta = deltaFrom
    ? await fetchDeltaDiff(ref, deltaFrom, headSha).catch(warnWithout('delta diff', null))
    : null
  const commentable = commentableLines(diff)
  const changedFiles = [...commentable.keys()]
  // Read at the base branch: the PR's own CLAUDE.md must not rewrite the rules it is judged by.
  const [conventions, memory, issues] = await Promise.all([
    fetchConventions(ref, head.baseSha, changedFiles).catch(warnWithout('conventions', [])),
    fetchMemory(slug, head.title, changedFiles),
    getRepositoryIssues(slug).catch(warnWithout('production errors', [])),
  ])
  const production = productionSignals(issues, changedFiles)

  const prContext = buildPrContext({
    reviewCount,
    previous: previous && {
      headSha: previous.review.headSha,
      verdict: previous.review.verdict,
      findings: previous.findings,
    },
    conversation,
    suppressions,
    threads: threads ?? [],
    botHandle,
  })
  const memoryContext = buildMemoryContext(memoryForFiles(memory, changedFiles))
  markMemoryUsed(memoryContext.noteIds)
  const context = [
    memoryContext.text,
    buildConventionsContext(conventions),
    buildProductionContext(production),
    buildDescriptionContext(head.body),
    buildFileManifest(diff),
    delta && deltaFrom ? buildDeltaNote(deltaFrom) : '',
    prContext,
  ]
    .filter(Boolean)
    .join('\n\n')
  if (context) {
    logger.info(
      {
        ...ref,
        contextChars: context.length,
        memoryNotes: memoryContext.noteIds.length,
        memoryDropped: memoryContext.dropped,
        liveErrors: production.length,
        conventions: conventions.map((file) => file.path),
        delta: delta ? deltaFrom : null,
      },
      'review has context',
    )
  }

  const provider = reviewProvider()
  const chunks = chunkDiff(delta ?? diff, provider.chunkChars)
  const outcomes = await reviewChunks(
    provider,
    { owner: ref.owner, repo: ref.repo, headSha },
    chunks,
    context,
    tokens,
  )
  const { review: raw, coverage } = resolveOutcome(outcomes)
  if (coverage.reviewed < coverage.total) logger.warn({ ...ref, ...coverage }, 'partial review')
  const checked = await withoutDisprovedCompileClaims(ref, headSha, raw.findings)
  const { fresh, repeated, settled } = settleFindings(
    checked,
    priorThreads,
    suppressedFindings(suppressions),
  )
  const remaining = [...fresh, ...repeated]
  const isComplete = coverage.reviewed === coverage.total
  const { verdict, stillBlocking } = reviewVerdict({
    remaining,
    priorThreads,
    isComplete,
  })
  const loop = closeRound({
    ref,
    round: review.round ?? 1,
    fresh,
    repeated,
    raised: checked,
    priorThreads,
    stillBlocking,
    previous: previous?.findings ?? [],
    delta,
    isComplete,
  })
  const summary = isComplete ? raw.summary : partialSummary(raw.summary, coverage)
  const merged = { ...raw, summary, findings: loop.findings, verdict }
  const report: ReviewReport = {
    review: merged,
    model: review.model ?? provider.model,
    coverage,
  }

  await clearFindings(review.id)
  await createFindings(findingRows(review.id, loop.findings))
  let threadUrls = new Map<string, string>()
  // GitHub sees only what is new; the console keeps every open finding. An approval GitHub
  // dismissed on push (a stale-approval ruleset) is posted again, or the PR stays gated.
  const isApprovalLost =
    merged.verdict === 'approve' &&
    isComplete &&
    !(await hasStandingApproval(ref).catch(warnWithout('standing approval', true)))
  const isUnchanged =
    fresh.length === 0 &&
    previous !== undefined &&
    previous.review.verdict === merged.verdict &&
    !isApprovalLost
  const isCurrent = await isStillHead(ref, headSha)
  if (attempt.isPosted) {
    logger.info({ ...ref, headSha }, 'an earlier attempt already posted this review')
  } else if (!isCurrent) {
    logger.info({ ...ref, headSha }, 'a newer commit was pushed — its review speaks for the PR')
  } else if (isUnchanged) {
    logger.info({ ...ref, headSha }, 'nothing new since the last review — no GitHub review posted')
  } else {
    const githubReviewId = await postPrReview(
      ref,
      headSha,
      {
        ...report,
        review: { ...merged, findings: loop.fresh },
        carried: {
          open: Math.max(repeated.length, stillBlocking.length),
          settled: settled.length,
        },
      },
      commentable,
    )
    attempt.isPosted = true
    threadUrls = await linkPostedThreads(ref, review.id, githubReviewId).catch(
      warnWithout('posted thread links', threadUrls),
    )
  }
  // Only a complete, posted (or unchanged) clean review may lift the bot's own earlier blocks.
  if (
    merged.verdict === 'approve' &&
    isComplete &&
    isCurrent &&
    (attempt.isPosted || isUnchanged)
  ) {
    await dismissStaleBlocks(ref, headSha).catch(warnWithout('stale review dismissal', 0))
  }
  logger.info(
    {
      ...ref,
      reviewId: review.id,
      verdict: merged.verdict,
      loopVerdict: loop.verdict,
      round: loop.round,
      fixed: loop.fixedFingerprints.length,
      fresh: fresh.length,
      repeated: repeated.length,
      settled: settled.length,
      chunks: chunks.length,
      tokens,
    },
    'review completed',
  )
  return {
    report,
    merged,
    deltaFrom: delta ? deltaFrom : null,
    loop: withThreadUrls(loop, threadUrls),
    memoryApplied: memoryContext.applied,
  }
}
