import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { useMembers } from '../../shared/console-data'
import { SEVERITY_TEXT } from '../../shared/console-ui'
import { rowLabel, type TriageRowProps, useItemStatus } from '../lib'

export function TriageRow({ bucket, item, active }: TriageRowProps) {
  const status = useItemStatus(item)
  const owner = useMembers().find((m) => m.id === status.assigneeUserId)?.name

  return (
    <Link
      to="/console/triage/$bucket"
      params={{ bucket }}
      search={(prev) => ({ ...prev, sel: item.id })}
      className={cn(
        'flex cursor-pointer flex-col gap-[5px] border-rule-soft border-b border-l-2 px-[18px] py-[13px]',
        active ? 'border-l-foreground bg-surface-subtle' : 'border-l-transparent bg-background',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'truncate font-semibold text-[13px]',
            status.done ? SEVERITY_TEXT.ok : SEVERITY_TEXT[item.severity],
          )}
        >
          {rowLabel(item, status)}
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground">{item.age}</span>
      </div>
      <span className={cn('text-[13px] leading-[18px] text-pretty', active && 'font-semibold')}>
        {item.title}
      </span>
      <div className="flex min-w-0 items-center gap-2 font-mono text-[11px]">
        <span
          title={item.repository ?? item.scopeLabel}
          className="max-w-[55%] shrink-0 truncate rounded-md border border-border px-1.5 py-px text-body"
        >
          {item.scopeLabel}
        </span>
        <span
          className={cn(
            'truncate',
            status.done ? 'text-severity-resolved' : 'text-muted-foreground',
          )}
        >
          {owner ? `assigned to ${owner}` : item.meta}
        </span>
      </div>
    </Link>
  )
}
