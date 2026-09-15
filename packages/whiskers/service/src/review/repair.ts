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
 * findings without a file + title. Everything else the schema defaults.
 */
export async function repairReviewText({ text }: { text: string }): Promise<string | null> {
  const candidate = repairJsonText(text) ?? text
  try {
    const parsed = JSON.parse(candidate) as { findings?: unknown }
    if (Array.isArray(parsed.findings)) parsed.findings = parsed.findings.filter(hasAnchor)
    const repaired = JSON.stringify(parsed)
    return repaired === text ? null : repaired
  } catch {
    return candidate === text ? null : candidate
  }
}
