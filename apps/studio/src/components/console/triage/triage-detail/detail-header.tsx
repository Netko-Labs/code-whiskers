import { Button } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { SEVERITY_BG } from '../../shared/console-ui'
import { type DetailPaneProps, primaryLabel, secondaryLabel } from '../lib'
import { AssignMenu } from './assign-menu'

const BADGE2_TONE: Record<string, string> = {
  'NO FINDINGS': 'text-sev-ok-ink bg-sev-ok/10',
  '1 BLOCKER': 'text-sev-info-ink bg-sev-info/10',
}

export function DetailHeader({ item, status, actions }: DetailPaneProps) {
  const done = status.resolved || status.approved
  const badge = status.resolved ? 'RESOLVED' : status.approved ? 'APPROVED' : item.badge

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3 border-border border-b px-6 py-4">
      <div className="flex min-w-0 flex-col gap-[7px]">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-md px-[7px] py-[3px] font-semibold text-[10px] text-zinc-50',
              done ? 'bg-sev-ok' : SEVERITY_BG[item.severity],
            )}
          >
            {badge}
          </span>
          {item.badge2 && (
            <span
              className={cn(
                'rounded-md px-[7px] py-[3px] font-semibold text-[10px]',
                BADGE2_TONE[item.badge2] ?? 'text-sev-critical-ink bg-sev-critical/10',
              )}
            >
              {item.badge2}
            </span>
          )}
          <span className="font-mono text-[11px] text-muted-foreground">{item.id}</span>
        </div>
        <h2 className="m-0 font-semibold text-[19px] tracking-[-0.02em] text-pretty">
          {item.title}
        </h2>
        <span className="font-mono text-muted-foreground text-xs">{item.subtitle}</span>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={actions.onSecondary}>
          {secondaryLabel(item)}
        </Button>
        <AssignMenu onAssign={actions.assignTo} />
        <Button size="sm" onClick={actions.onPrimary}>
          {primaryLabel(item, status)}
        </Button>
      </div>
    </header>
  )
}
