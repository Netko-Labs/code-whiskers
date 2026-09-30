import { createLogger } from '@code-whiskers/logger'
import { type LlmFinding, type LlmReview, LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { generateObject } from 'ai'
import { addUsage, openrouterModel, type TokenTally } from '../shared/llm'
import { groundFindings } from './grounding'
import { BLOCKING_SEVERITIES } from './render'
import { repairReviewText } from './repair'

const logger = createLogger('whiskers-review')

const SYSTEM = `You are a senior code reviewer for pull requests. You review ONE SLICE of a larger
diff; a preamble may list every file the PR changes.

Precision beats recall. Report a finding only when the lines in this slice prove it:
- "evidence" is the exact line from the NEW side of this slice where the problem is, copied
  verbatim (one line, or two adjacent lines). No evidence line, no finding.
- Code you cannot see is correct. Never report that a file, export, key, translation, caller,
  migration, route or type is missing, unused or not updated unless this slice itself shows it
  deleted. Files in the PR's file list exist and changed, even if your slice does not show them.
- Do not report what types or tests would already catch, style, naming, or missing comments.
- How a library, framework or the language behaves must be shown by the lines in front of you.
  From memory alone ("close() disables the client", "$ matches before a newline"), file it as
  "low" with a title phrased as a question.
- "The author's description" states intended design: do not file what it decides on purpose
  unless the shown code contradicts it.
- Prefer three solid findings over ten plausible ones; an empty list is a good review.

Severity — be precise, not timid:
- "critical": exploitable security or authorization flaw, data loss or corruption.
- "high": a failure the shown lines cause on an ordinary path — a crash, a wrong result a user
  or caller will hit, a check that lets the wrong person act, an unhandled error that stops a
  process. Missing a real high is worse than a false medium.
- "medium": correct on the normal path but wrong on a realistic edge — retries, partial failure,
  pagination limits, concurrent writes.
- "low": hardening and small robustness gaps.
Line numbers reference the NEW side of the diff.

Output: "title" states the problem, not the fix, under 80 characters, sentence case, no
trailing period; "body" at most two sentences — what breaks and when; "suggestion" the concrete
fix in one sentence or a short snippet, or null. Plain statements, no "I noticed", no hedging,
no emoji. "summary": exactly one sentence on what this slice changes in behaviour, filled even
when you find nothing. Verdict: "request_changes" when any high/critical finding exists,
otherwise "approve".

Preamble sections: "Team rules" come from the maintainers — follow them, including severity.
"Project conventions" are the repository's CLAUDE.md / AGENTS.md — report a clear violation in a
changed line as category "convention"; never flag code that follows them. "Where this PR already
stands" is history — use it, never review it as code.
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
  const { kept, outsideSlice, unquoted } = groundFindings(object.findings, diff)
  if (outsideSlice + unquoted > 0) {
    logger.info({ kept: kept.length, outsideSlice, unquoted }, 'ungrounded findings dropped')
  }
  return { ...object, findings: kept }
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
