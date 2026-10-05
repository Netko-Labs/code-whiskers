import { cn } from '@code-whiskers/ui/lib/utils'
import { SeverityDot } from '@/components/shared/status'
import {
  FINDING_STATUS_HINT,
  FINDING_STATUS_LABEL,
  SEVERITY_ORDER,
  SEVERITY_TONE,
} from '../shared/review-model'
import { type FindingFilterBarProps, STATUS_TABS } from './lib'

const PILL =
  'focus-ring inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-2xs transition-colors duration-fast'

export function FindingFilterBar({
  findings,
  status,
  severity,
  onStatus,
  onSeverity,
}: FindingFilterBarProps) {
  const inStatus = findings.filter((entry) => status === 'all' || entry.status === status)

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div role="tablist" aria-label="Finding status" className="flex items-center gap-0.5">
        {STATUS_TABS.map((tab) => {
          const count = findings.filter((entry) => entry.status === tab).length
          if (tab !== 'open' && count === 0) return null
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={status === tab}
              title={FINDING_STATUS_HINT[tab]}
              onClick={() => onStatus(tab)}
              className={cn(
                PILL,
                status === tab
                  ? 'bg-surface-selected font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
              )}
            >
              {FINDING_STATUS_LABEL[tab]}
              <span className="font-mono tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>
      <div role="group" aria-label="Severity" className="flex items-center gap-0.5">
        {SEVERITY_ORDER.map((option) => {
          const count = inStatus.filter((entry) => entry.finding.severity === option).length
          if (count === 0) return null
          const isOn = severity === option
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isOn}
              onClick={() => onSeverity(isOn ? 'all' : option)}
              className={cn(
                PILL,
                isOn
                  ? 'bg-surface-selected font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
              )}
            >
              <SeverityDot tone={SEVERITY_TONE[option]} size="sm" />
              <span className="capitalize">{option}</span>
              <span className="font-mono tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
