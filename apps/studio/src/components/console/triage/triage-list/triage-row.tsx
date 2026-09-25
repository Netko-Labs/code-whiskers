import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { useMembers } from '../../shared/console-data'
import { SEVERITY_BG } from '../../shared/console-ui'
import { rowMeta, type TriageRowProps, useItemStatus } from '../lib'

export function TriageRow({ bucket, item, active }: TriageRowProps) {
  const status = useItemStatus(item)
  const owner = useMembers().find((m) => m.id === status.assigneeUserId)?.name

  return (
    <Link
      to="/console/triage/$bucket"
      params={{ bucket }}
      search={(prev) => ({ ...prev, sel: item.id })}
      className={cn(
        'flex cursor-pointer gap-3 border-rule-soft border-b border-l-2 py-3 pr-5 pl-[18px] transition-colors',
        active
          ? 'border-l-foreground bg-surface-subtle'
          : 'border-l-transparent hover:bg-surface-subtle/60',
      )}
    >
      <span
        className={cn(
          'mt-[6px] size-2 shrink-0 rounded-full',
          status.done ? 'bg-rule-strong' : SEVERITY_BG[item.severity],
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn(
            'line-clamp-2 text-[13.5px] leading-[19px] text-pretty',
            active ? 'font-semibold' : 'font-medium',
            status.done && 'text-muted-foreground',
          )}
        >
          {item.title}
        </span>
        <span className="flex items-baseline gap-2 text-[12px] text-muted-foreground">
          <span className="min-w-0 flex-1 truncate">{rowMeta(item, status, owner)}</span>
          <span className="shrink-0 font-mono text-[11px] text-faint tabular-nums">{item.age}</span>
        </span>
      </div>
    </Link>
  )
}
