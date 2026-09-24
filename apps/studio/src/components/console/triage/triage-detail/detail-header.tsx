import { Button } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconBrandGithub } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { SEVERITY_BG } from '../../shared/console-ui'
import { type DetailPaneProps, primaryLabel, secondaryLabel, useDetailShortcuts } from '../lib'
import { AssignMenu } from './assign-menu'

const BADGE2_TONE: Record<string, string> = {
  'NO FINDINGS': 'text-severity-resolved-ink bg-severity-resolved/10',
  '1 BLOCKER': 'text-severity-info-ink bg-severity-info/10',
}

export function DetailHeader({ item, status, actions }: DetailPaneProps) {
  useDetailShortcuts(actions)
  const done = status.resolved || status.approved
  const badge = status.resolved ? 'RESOLVED' : status.approved ? 'APPROVED' : item.badge

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3 border-border border-b px-6 py-4">
      <div className="flex min-w-0 flex-col gap-[7px]">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-md px-[7px] py-[3px] font-semibold text-[10px] text-zinc-50',
              done ? 'bg-severity-resolved' : SEVERITY_BG[item.severity],
            )}
          >
            {badge}
          </span>
          {item.badge2 && (
            <span
              className={cn(
                'rounded-md px-[7px] py-[3px] font-semibold text-[10px]',
                BADGE2_TONE[item.badge2] ?? 'text-severity-error-ink bg-severity-error/10',
              )}
            >
              {item.badge2}
            </span>
          )}
          <span className="font-mono text-[11px] text-muted-foreground">{item.handle}</span>
        </div>
        <h2 className="m-0 font-semibold text-[19px] tracking-[-0.02em] text-pretty">
          {item.title}
        </h2>
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
          {item.repository && (
            <Link
              to="."
              search={(prev) => ({ ...prev, scope: item.repository ?? undefined })}
              title={`Show only ${item.repository}`}
              className="flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 font-mono text-body hover:bg-surface-subtle"
            >
              <IconBrandGithub className="size-3.5" stroke={1.75} />
              {item.repository}
            </Link>
          )}
          <span className="min-w-0 truncate font-mono text-muted-foreground">{item.subtitle}</span>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={actions.onSecondary} title="s">
          {secondaryLabel(item, status)}
        </Button>
        <AssignMenu
          assigneeUserId={status.assigneeUserId}
          isDisabled={!item.triage}
          onAssign={actions.assignTo}
        />
        <Button size="sm" onClick={actions.onPrimary} title="e">
          {primaryLabel(item, status)}
        </Button>
      </div>
    </header>
  )
}
