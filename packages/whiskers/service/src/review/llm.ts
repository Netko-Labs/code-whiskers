import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { type LlmReview, LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'

const openrouter = createOpenRouter({ apiKey: whiskersEnvConfig.openrouter.apiKey })

const SYSTEM = `You are a senior code reviewer for pull requests.
Review the unified diff and report only real, actionable findings — bugs,
security holes, performance traps, broken contracts. Do not pad with nitpicks;
an empty findings list is a valid, good review. Line numbers must reference the
NEW side of the diff. Verdict: "approve" when nothing blocks merging,
"request_changes" when any high/critical finding exists, otherwise "comment".`

export async function reviewChunk(diff: string): Promise<LlmReview> {
  const { object } = await generateObject({
    model: openrouter(whiskersEnvConfig.openrouter.model),
    schema: LlmReviewSchema,
    system: SYSTEM,
    prompt: `Review this diff:\n\n${diff}`,
  })
  return object
}

/** Worst verdict wins; findings and summaries concatenate. */
export function mergeReviews(reviews: LlmReview[]): LlmReview {
  const rank = { approve: 0, comment: 1, request_changes: 2 } as const
  return {
    findings: reviews.flatMap((r) => r.findings),
    summary: reviews
      .map((r) => r.summary)
      .filter(Boolean)
      .join('\n\n'),
    verdict: reviews.reduce<LlmReview['verdict']>(
      (worst, r) => (rank[r.verdict] > rank[worst] ? r.verdict : worst),
      'approve',
    ),
  }
}
