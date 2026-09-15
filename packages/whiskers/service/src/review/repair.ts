import { LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { repairJsonText } from '../shared/llm'

function hasAnchor(finding: unknown): boolean {
  return (
    typeof finding === 'object' &&
    finding !== null &&
    typeof (finding as { file?: unknown }).file === 'string' &&
    typeof (finding as { title?: unknown }).title === 'string'
  )
}

/**
 * Second chance for a review the SDK rejected: unfence the JSON, then drop
 * findings without a file + title. Returns null unless the result actually
 * satisfies the schema — handing back still-invalid text only buys a retry
 * that fails the same way, and brace-slicing can corrupt prose-wrapped output.
 */
export async function repairReviewText({ text }: { text: string }): Promise<string | null> {
  const candidate = repairJsonText(text) ?? text
  let parsed: { findings?: unknown }
  try {
    parsed = JSON.parse(candidate) as { findings?: unknown }
  } catch {
    return null
  }
  if (Array.isArray(parsed.findings)) parsed.findings = parsed.findings.filter(hasAnchor)
  if (!LlmReviewSchema.safeParse(parsed).success) return null
  const repaired = JSON.stringify(parsed)
  return repaired === text ? null : repaired
}
