import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { SEVERITY_TEXT } from '../../shared/console-ui'
import { useConsoleStore } from '../../use-console-store'
import { rowLabel, type TriageRowProps, useItemStatus } from '../lib'

export function TriageRow({ bucket, item, active }: TriageRowProps) {
  const status = useItemStatus(item.id)
  const owner = useConsoleStore((s) => s.assignee[item.id])

  return (
    <Link
      to="/console/triage/$bucket"
      params={{ bucket }}
      search={{ sel: item.id }}
      className={cn(
        'flex cursor-pointer flex-col gap-[5px] border-rule-soft border-b border-l-2 px-[18px] py-[13px]',
        active ? 'border-l-foreground bg-surface-subtle' : 'border-l-transparent bg-background',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'font-semibold text-[13px]',
            status.done ? SEVERITY_TEXT.ok : SEVERITY_TEXT[item.severity],
          )}
        >
          {rowLabel(item, status)}
        </span>
        <span className="text-[11px] text-muted-foreground">{item.age}</span>
      </div>
      <span className={cn('text-[13px] leading-[18px] text-pretty', active && 'font-semibold')}>
        {item.title}
      </span>
      <span
        className={cn(
          'font-mono text-[11px]',
          status.done ? 'text-severity-resolved' : 'text-muted-foreground',
        )}
      >
        {owner ? `assigned to ${owner}` : item.meta}
      </span>
    </Link>
  )
}
