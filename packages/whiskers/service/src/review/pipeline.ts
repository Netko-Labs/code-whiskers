import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import type { Review } from '@code-whiskers/whiskers-domain'
import { clearFindings, createFindings } from '../mutations'
import { countReviews, getPreviousReview } from '../queries'
import { mapWithConcurrency, type TokenTally } from '../shared/llm'
import { chunkDiff, commentableLines } from './chunk'
import { buildPrContext } from './context'
import { buildConventionsContext, fetchConventions } from './conventions'
import { fetchPrConversation, fetchPrDiff, type PrRef, postPrReview } from './github'
import { resolveOutcome, reviewChunkWithRetry } from './outcome'
import type { ReviewReport } from './render'
import { buildRulesContext, fetchRules, rulesForFiles } from './rules'
import { settledVerdict, settleFindings, suppressedFindings } from './settle'
import { fetchSuppressions } from './suppressions'
import { fetchBotThreads } from './threads'
import type { PipelineResult } from './types'

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
  headSha: string,
  review: Review,
  tokens: TokenTally,
): Promise<PipelineResult> {
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
      fetchBotThreads(ref, botHandle).catch(warnWithout('review threads', [])),
    ])
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
    threads,
    botHandle,
  })
  const applicable = rulesForFiles(rules, changedFiles)
  const context = [buildRulesContext(applicable), buildConventionsContext(conventions), prContext]
    .filter(Boolean)
    .join('\n\n')
  if (context) {
    logger.info(
      {
        ...ref,
        contextChars: context.length,
        rules: applicable.length,
        conventions: conventions.map((file) => file.path),
      },
      'review has context',
    )
  }

  const chunks = chunkDiff(diff)
  const outcomes = await mapWithConcurrency(chunks, (chunk) =>
    reviewChunkWithRetry(chunk, context, tokens),
  )
  const { review: raw, coverage } = resolveOutcome(outcomes)
  if (coverage.reviewed < coverage.total) logger.warn({ ...ref, ...coverage }, 'partial review')
  const { fresh, repeated, settled } = settleFindings(
    raw.findings,
    threads,
    suppressedFindings(suppressions),
  )
  const remaining = [...fresh, ...repeated]
  const merged = { ...raw, findings: remaining, verdict: settledVerdict(remaining) }
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
  // GitHub sees only what is new; the console keeps every open finding.
  const isUnchanged =
    fresh.length === 0 && previous !== undefined && previous.review.verdict === merged.verdict
  if (isUnchanged) {
    logger.info({ ...ref, headSha }, 'nothing new since the last review — no GitHub review posted')
  } else {
    await postPrReview(
      ref,
      headSha,
      {
        ...report,
        review: { ...merged, findings: fresh },
        carried: { open: repeated.length, settled: settled.length },
      },
      commentable,
    )
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
