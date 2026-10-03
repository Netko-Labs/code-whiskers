import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { Review } from '@code-whiskers/whiskers-domain'
import { clearFindings, createFindings } from '../mutations'
import { countReviews, getPreviousReview } from '../queries'
import { mapWithConcurrency, type TokenTally } from '../shared/llm'
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
import { resolveOutcome, reviewChunkWithRetry } from './outcome'
import type { ReviewReport } from './render'
import { dismissStaleBlocks, hasStandingApproval, isStillHead } from './review-state'
import { buildRulesContext, fetchRules, rulesForFiles } from './rules'
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
  const [diff, conversation, previous, reviewCount, suppressions, rules, threads] =
    await Promise.all([
      fetchPrDiff(ref),
      fetchPrConversation(ref).catch(
        warnWithout('conversation', { verdicts: [], discussion: [], inline: [] }),
      ),
      getPreviousReview(ref.owner, ref.repo, ref.prNumber, review.createdAt),
      countReviews(ref.owner, ref.repo, ref.prNumber, review.createdAt),
      fetchSuppressions(slug),
      fetchRules(slug),
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
  const conventions = await fetchConventions(ref, headSha, changedFiles).catch(
    warnWithout('conventions', []),
  )

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
  const applicable = rulesForFiles(rules, changedFiles)
  const context = [
    buildRulesContext(applicable),
    buildConventionsContext(conventions),
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
        rules: applicable.length,
        conventions: conventions.map((file) => file.path),
        delta: delta ? deltaFrom : null,
      },
      'review has context',
    )
  }

  const chunks = chunkDiff(delta ?? diff)
  const outcomes = await mapWithConcurrency(chunks, (chunk) =>
    reviewChunkWithRetry(chunk, context, tokens),
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
  const summary = isComplete ? raw.summary : partialSummary(raw.summary, coverage)
  const merged = { ...raw, summary, findings: remaining, verdict }
  const report: ReviewReport = {
    review: merged,
    model: review.model ?? whiskersEnvConfig.openrouter.model,
    coverage,
  }

  await clearFindings(review.id)
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
    await postPrReview(
      ref,
      headSha,
      {
        ...report,
        review: { ...merged, findings: fresh },
        carried: {
          open: Math.max(repeated.length, stillBlocking.length),
          settled: settled.length,
        },
      },
      commentable,
    )
    attempt.isPosted = true
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
      fresh: fresh.length,
      repeated: repeated.length,
      settled: settled.length,
      chunks: chunks.length,
      tokens,
    },
    'review completed',
  )
  return { report, merged }
}
