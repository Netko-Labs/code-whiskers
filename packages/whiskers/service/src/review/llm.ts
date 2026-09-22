import { type LlmFinding, type LlmReview, LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { generateObject } from 'ai'
import { addUsage, openrouterModel, type TokenTally } from '../shared/llm'
import { BLOCKING_SEVERITIES } from './render'
import { repairReviewText } from './repair'

const SYSTEM = `You are a senior code reviewer for pull requests.
Review the unified diff and report only real, actionable findings — bugs,
security holes, performance traps, broken contracts. Do not pad with nitpicks;
an empty findings list is a valid, good review. Line numbers must reference the
NEW side of the diff. Verdict: "request_changes" when any high/critical finding
exists, otherwise "approve" — non-blocking nitpicks do not block a merge.
"summary": exactly one sentence on what this diff changes in behaviour, not a
file list and not a verdict. Fill it even when you find nothing.
Each finding is rendered as a table row and a short comment, so keep it tight:
"title" states the problem, not the fix ("Pagination stops at 100 installations",
not "Fetch all pages"), under 80 characters, sentence case, no trailing period; "body" at most
two sentences — what breaks and when; "suggestion" the concrete fix in one
sentence or a short code snippet, or null. Plain statements, no "I noticed",
no "potential issue" hedging, no emoji.
A re-review may be handed a preamble describing where the PR already stands;
treat it as history, never as code to review.
Respond with the JSON object only, no markdown fences, no prose.`

/**
 * Measured on 30 production reviews: the latency distribution is bimodal — a
 * chunk either answers in tens of seconds or stalls outright. 180s nursed every
 * stall for three minutes before the single retry stalled for three more, which
 * is why 7 of 9 failures landed at ~363s. Abandon a stall fast; the caller has
 * three attempts and splits the chunk on the first timeout.
 */
const LLM_TIMEOUT_MS = 90_000

/**
 * The verdict the LLM emits per chunk is advisory only — the review posted to
 * GitHub uses this severity-derived policy, and it is binary: any high/critical
 * finding REQUEST_CHANGES, everything else APPROVEs. Non-blocking nitpicks ride
 * along as comments on an approval; a bare COMMENT review is never posted.
 */
export function resolveVerdict(findings: LlmFinding[]): LlmReview['verdict'] {
  return findings.some((f) => BLOCKING_SEVERITIES.has(f.severity)) ? 'request_changes' : 'approve'
}

export async function reviewChunk(
  diff: string,
  context: string,
  tokens: TokenTally,
): Promise<LlmReview> {
  const preamble = context ? `${context}\n\n` : ''
  const { object, usage } = await generateObject({
    model: openrouterModel(),
    schema: LlmReviewSchema,
    system: SYSTEM,
    prompt: `${preamble}Review this diff:\n\n${diff}`,
    abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    repairText: repairReviewText,
  })
  addUsage(tokens, usage)
  return object
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
