import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type LlmFinding, type LlmReview, LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'

const openrouter = createOpenRouter({ apiKey: whiskersEnvConfig.openrouter.apiKey })

const SYSTEM = `You are a senior code reviewer for pull requests.
Review the unified diff and report only real, actionable findings — bugs,
security holes, performance traps, broken contracts. Do not pad with nitpicks;
an empty findings list is a valid, good review. Line numbers must reference the
NEW side of the diff. Verdict: "approve" when there are no findings,
"request_changes" when any high/critical finding exists, otherwise "comment".`

const BLOCKING_SEVERITIES: ReadonlySet<LlmFinding['severity']> = new Set(['high', 'critical'])

/**
 * The verdict the LLM emits per chunk is advisory only — the review posted to
 * GitHub uses this severity-derived policy, so a clean diff reliably APPROVEs
 * and a high/critical finding reliably REQUEST_CHANGES.
 */
export function resolveVerdict(findings: LlmFinding[]): LlmReview['verdict'] {
  if (findings.some((f) => BLOCKING_SEVERITIES.has(f.severity))) return 'request_changes'
  return findings.length === 0 ? 'approve' : 'comment'
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
