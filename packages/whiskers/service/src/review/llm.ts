import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type LlmFinding, type LlmReview, LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { createOpenRouter, type OpenRouterChatSettings } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'

const openrouter = createOpenRouter({ apiKey: whiskersEnvConfig.openrouter.apiKey })

/**
 * When REVIEW_PROVIDER_ORDER pins providers, fallbacks are disabled so a
 * request can never route to an unlisted (slow/flaky) provider — a total
 * miss surfaces through the existing retry + failure paths instead.
 */
export const openrouterModelSettings: OpenRouterChatSettings | undefined =
  whiskersEnvConfig.openrouter.providerOrder.length > 0
    ? {
        provider: {
          order: whiskersEnvConfig.openrouter.providerOrder,
          allow_fallbacks: false,
        },
      }
    : undefined

const SYSTEM = `You are a senior code reviewer for pull requests.
Review the unified diff and report only findings a maintainer would definitely
act on: real bugs, security holes, performance traps, broken contracts. Never
report style preferences, defensive-programming suggestions, documentation or
naming nits, hypothetical edge cases without a concrete failure path, or issues
in code outside this diff. An empty findings list is a valid, good review —
most competent changes deserve one. When repository guidelines are provided,
enforce them: a clear violation of an explicit repo rule is a reportable
finding, but do not invent rules beyond what they state. Line numbers must
reference the NEW side of the diff. Verdict: "request_changes" when any
high/critical finding exists, otherwise "approve" — non-blocking findings do
not block a merge.`

const BLOCKING_SEVERITIES: ReadonlySet<LlmFinding['severity']> = new Set(['high', 'critical'])
const SEVERITY_RANK: Record<LlmFinding['severity'], number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

/** The pickiness knob: drop findings below `min` (REVIEW_MIN_SEVERITY). */
export function filterBySeverity(
  findings: LlmFinding[],
  min: LlmFinding['severity'],
): LlmFinding[] {
  return findings.filter((f) => SEVERITY_RANK[f.severity] >= SEVERITY_RANK[min])
}
// A stuck provider socket must surface as a failed review, never a silent hang.
const LLM_TIMEOUT_MS = 180_000

/**
 * The verdict the LLM emits per chunk is advisory only — the review posted to
 * GitHub uses this severity-derived policy, and it is binary: any high/critical
 * finding REQUEST_CHANGES, everything else APPROVEs. Non-blocking nitpicks ride
 * along as comments on an approval; a bare COMMENT review is never posted.
 */
export function resolveVerdict(findings: LlmFinding[]): LlmReview['verdict'] {
  return findings.some((f) => BLOCKING_SEVERITIES.has(f.severity)) ? 'request_changes' : 'approve'
}

export async function reviewChunk(diff: string, guidelines = ''): Promise<LlmReview> {
  const context = guidelines
    ? `Repository guidelines (the project's own rules, from CLAUDE.md/AGENTS.md):\n${guidelines}\n\n`
    : ''
  const { object } = await generateObject({
    model: openrouter(whiskersEnvConfig.openrouter.model, openrouterModelSettings),
    schema: LlmReviewSchema,
    system: SYSTEM,
    prompt: `${context}Review this diff:\n\n${diff}`,
    abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
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
