import { cn } from '@code-whiskers/ui/lib/utils'
import { SeverityDot } from '@/components/shared/status'
import { countsLabel, SEVERITY_ORDER, SEVERITY_TONE } from '../review-model'
import type { SeverityCountsProps } from './types'

/** Dot and count per severity present; nothing at all reads as a quiet dash. */
export function SeverityCounts({ counts, className }: SeverityCountsProps) {
  const present = SEVERITY_ORDER.filter((severity) => counts[severity] > 0)
  if (present.length === 0) {
    return <span className={cn('font-mono text-2xs text-faint', className)}>—</span>
  }

  return (
    <span
      role="img"
      aria-label={countsLabel(counts)}
      title={countsLabel(counts)}
      className={cn('inline-flex items-center gap-2', className)}
    >
      {present.map((severity) => (
        <span key={severity} className="inline-flex items-center gap-1">
          <SeverityDot tone={SEVERITY_TONE[severity]} size="sm" />
          <span className="font-mono text-2xs text-muted-foreground tabular-nums">
            {counts[severity]}
          </span>
        </span>
      ))}
    </span>
  )
}
