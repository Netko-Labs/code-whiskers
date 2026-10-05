import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { DataRow, DataRowLead, DataRowMeta } from '@/components/shared/data-list'
import { SeverityDot } from '@/components/shared/status'
import { reasonOf, SEVERITY_TONE } from '../../shared/console-data'
import { TrendBars } from '../../shared/issue-ui'
import { formatUntil, type TriageRowProps, useItemStatus } from '../lib'

/** Two quiet lines: what it is, then why it is here. A triaged row folds away in place. */
export function TriageRow({ bucket, entry, isSelected }: TriageRowProps) {
  const { item, isLeaving } = entry
  const status = useItemStatus(item)
  const tone = SEVERITY_TONE[item.severity]
  const reason = status.snoozedUntil
    ? `Snoozed until ${formatUntil(status.snoozedUntil)}`
    : reasonOf(item)

  return (
    <DataRow
      isSelected={isSelected && !isLeaving}
      tone={tone}
      density="auto"
      className={cn(
        'h-[54px] overflow-hidden transition-[height,opacity,padding] duration-base ease-out-quart',
        isLeaving && 'pointer-events-none h-0 min-h-0! py-0 opacity-0',
      )}
      render={
        <Link
          to="/console/triage/$bucket"
          params={{ bucket }}
          search={(prev) => ({ ...prev, sel: item.id })}
          replace
          tabIndex={isLeaving ? -1 : undefined}
        />
      }
    >
      <DataRowLead>
        <SeverityDot tone={tone} isPulsing={item.kind === 'alert'} label={item.label} />
      </DataRowLead>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-baseline gap-3">
          <span
            className={cn('min-w-0 flex-1 truncate', isSelected ? 'font-semibold' : 'font-medium')}
          >
            {item.title}
          </span>
          <DataRowMeta>{item.age}</DataRowMeta>
        </span>
        <span className="flex min-w-0 items-center gap-3 text-2xs text-muted-foreground">
          <span className="min-w-0 flex-1 truncate">
            {item.scopeLabel} · {reason}
          </span>
          {item.issue && item.issue.trend.length > 1 && (
            <TrendBars values={item.issue.trend} className="h-3 w-12 shrink-0" />
          )}
        </span>
      </span>
    </DataRow>
  )
}
