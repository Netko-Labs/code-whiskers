import { createLogger } from '@code-whiskers/logger'
import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import type { TokenTally } from '../shared/llm'
import { groundFindings } from './grounding'
import type { ReviewSession } from './providers'
import { BLOCKING_SEVERITIES } from './render'

const logger = createLogger('whiskers-review')

/**
 * The verdict the LLM emits per chunk is advisory only — the review posted to
 * GitHub uses this severity-derived policy, and it is binary: any high/critical
 * finding REQUEST_CHANGES, everything else APPROVEs. Non-blocking nitpicks ride
 * along as comments on an approval; a bare COMMENT review is never posted.
 */
export function resolveVerdict(findings: LlmFinding[]): LlmReview['verdict'] {
  return findings.some((f) => BLOCKING_SEVERITIES.has(f.severity)) ? 'request_changes' : 'approve'
}

/** Whichever provider answered, a finding stands only on the lines this slice shows. */
export async function reviewChunk(
  session: ReviewSession,
  diff: string,
  context: string,
  tokens: TokenTally,
): Promise<LlmReview> {
  const answer = await session.review(diff, context, tokens)
  const { kept, outsideSlice, unquoted } = groundFindings(answer.findings, diff)
  if (outsideSlice + unquoted > 0) {
    logger.info({ kept: kept.length, outsideSlice, unquoted }, 'ungrounded findings dropped')
  }
  return { ...answer, findings: kept }
}

/** Findings concatenate, summaries stack one per line; the verdict derives from the merged findings. */
export function mergeReviews(reviews: LlmReview[]): LlmReview {
  const findings = reviews.flatMap((r) => r.findings)
  return {
    findings,
    summary: reviews
      .map((r) => r.summary)
      .filter(Boolean)
      .join('\n'),
    verdict: resolveVerdict(findings),
  }
}
