import type { Finding, LoopVerdict } from '@code-whiskers/whiskers-domain'
import { BLOCKING_SEVERITIES } from '../render'
import type { HumanReason, ReviewedFinding } from '../types'
import { MAX_ROUNDS } from './constants'

function blockingIds(findings: Pick<Finding, 'severity' | 'fingerprint'>[]): Set<string> {
  return new Set(
    findings
      .filter((f) => BLOCKING_SEVERITIES.has(f.severity) && f.fingerprint)
      .map((f) => f.fingerprint as string),
  )
}

/**
 * The loop hands over to a person instead of spinning: at the round limit, or when two pushes in
 * a row left exactly the same blockers standing.
 */
export function limitLoop(
  verdict: LoopVerdict,
  round: number,
  findings: ReviewedFinding[],
  previous: Pick<Finding, 'severity' | 'fingerprint'>[],
): { verdict: LoopVerdict; humanReason: HumanReason | null } {
  if (verdict === 'mergeable') return { verdict, humanReason: null }
  if (round >= MAX_ROUNDS) return { verdict: 'needs_human', humanReason: 'round_limit' }
  const now = blockingIds(findings)
  const before = blockingIds(previous)
  const isUnchanged =
    now.size > 0 && now.size === before.size && [...now].every((id) => before.has(id))
  // Two pushes in a row left every blocker standing: raised by round N-2 at the latest.
  const isStalled =
    isUnchanged &&
    findings
      .filter((f) => BLOCKING_SEVERITIES.has(f.severity))
      .every((f) => f.sinceRound <= round - 2)
  return isStalled
    ? { verdict: 'needs_human', humanReason: 'stalled' }
    : { verdict, humanReason: null }
}
