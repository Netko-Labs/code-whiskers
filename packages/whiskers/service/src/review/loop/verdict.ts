import type { LlmFinding, LoopVerdict } from '@code-whiskers/whiskers-domain'
import { BLOCKING_SEVERITIES } from '../render'

/**
 * Where the loop stands, from every open finding (carried blockers included). A critical blocks
 * outright; a high asks for changes; a review that skipped sections never vouches for a merge.
 * `needs_human` comes from `limitLoop`, which caps the rounds and spots a stall.
 */
export function loopVerdict(
  findings: Pick<LlmFinding, 'severity'>[],
  isComplete: boolean,
): LoopVerdict {
  if (findings.some((f) => f.severity === 'critical')) return 'blocked'
  if (findings.some((f) => BLOCKING_SEVERITIES.has(f.severity))) return 'needs_changes'
  return isComplete ? 'mergeable' : 'needs_changes'
}
