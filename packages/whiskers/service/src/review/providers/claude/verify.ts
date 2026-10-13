import {
  type LlmFinding,
  type LlmReview,
  type LlmVerdicts,
  LlmVerdictsSchema,
} from '@code-whiskers/whiskers-domain'
import { z } from 'zod'

const BLOCKING = new Set(['high', 'critical'])
let schema: Record<string, unknown> | undefined

export function verdictsJsonSchema(): Record<string, unknown> {
  schema ??= z.toJSONSchema(LlmVerdictsSchema, { target: 'draft-7' }) as Record<string, unknown>
  return schema
}

export const VERIFY_SYSTEM = `You verify findings another reviewer raised on a pull request. The
repository at the PR head is your working directory: read the cited code and whatever it depends
on before deciding. Keep a finding only when the code proves the defect exists in this PR and a
careful senior engineer would want it fixed. Drop it when the claim is wrong, already handled
elsewhere, cannot happen, speculative, a nit, or something the team memory says not to flag. A
finding that breaks a team rule stays. Give kept findings the severity they deserve: "high" or
"critical" only when it breaks users, data or security. Answer through the structured output
tool with one verdict per finding, by its index.`

/** The checker sees what the reviewer saw — team memory and conventions included — plus the claims. */
export function verifyPrompt(diff: string, context: string, findings: LlmFinding[]): string {
  const claims = findings.map((finding, index) => ({
    index,
    file: finding.file,
    line: finding.line,
    severity: finding.severity,
    title: finding.title,
    body: finding.body,
    evidence: finding.evidence,
  }))
  const preamble = context ? `${context}\n\n` : ''
  return `${preamble}Diff under review:\n\n${diff}\n\nFindings to verify:\n${JSON.stringify(claims, null, 1)}`
}

/**
 * Keeps what the checker confirmed, at the severity it gave; a finding it never ruled on stays as
 * raised, so a truncated answer cannot silently drop a real bug.
 */
export function applyVerdicts(review: LlmReview, { verdicts }: LlmVerdicts): LlmReview {
  const ruling = new Map(verdicts.map((verdict) => [verdict.index, verdict]))
  const findings = review.findings.flatMap((finding, index) => {
    const verdict = ruling.get(index)
    if (!verdict) return [finding]
    return verdict.keep ? [{ ...finding, severity: verdict.severity }] : []
  })
  const isBlocking = findings.some((finding) => BLOCKING.has(finding.severity))
  return { ...review, findings, verdict: isBlocking ? 'request_changes' : 'approve' }
}
