import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type LlmFinding, type LlmReview, LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'

const openrouter = createOpenRouter({ apiKey: whiskersEnvConfig.openrouter.apiKey })

const SYSTEM = `You are a senior code reviewer for pull requests.
Review the unified diff and report only real, actionable findings — bugs,
security holes, performance traps, broken contracts. Do not pad with nitpicks;
an empty findings list is a valid, good review. Line numbers must reference the
NEW side of the diff. Verdict: "request_changes" when any high/critical finding
exists, otherwise "approve" — non-blocking nitpicks do not block a merge.`

const BLOCKING_SEVERITIES: ReadonlySet<LlmFinding['severity']> = new Set(['high', 'critical'])

/**
 * The verdict the LLM emits per chunk is advisory only — the review posted to
 * GitHub uses this severity-derived policy, and it is binary: any high/critical
 * finding REQUEST_CHANGES, everything else APPROVEs. Non-blocking nitpicks ride
 * along as comments on an approval; a bare COMMENT review is never posted.
 */
export function resolveVerdict(findings: LlmFinding[]): LlmReview['verdict'] {
  return findings.some((f) => BLOCKING_SEVERITIES.has(f.severity)) ? 'request_changes' : 'approve'
}

export async function reviewChunk(diff: string): Promise<LlmReview> {
  const { object } = await generateObject({
    model: openrouter(whiskersEnvConfig.openrouter.model),
    schema: LlmReviewSchema,
    system: SYSTEM,
    prompt: `Review this diff:\n\n${diff}`,
  })
  return object
}

/** Findings and summaries concatenate; the verdict derives from the merged findings. */
export function mergeReviews(reviews: LlmReview[]): LlmReview {
  const findings = reviews.flatMap((r) => r.findings)
  return {
    findings,
    summary: reviews
      .map((r) => r.summary)
      .filter(Boolean)
      .join('\n\n'),
    verdict: resolveVerdict(findings),
  }
}
