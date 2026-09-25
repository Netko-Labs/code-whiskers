import { Button } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconBrandGithub } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { SEVERITY_BG } from '../../shared/console-ui'
import {
  type DetailHeaderProps,
  primaryLabel,
  secondaryLabel,
  stateLine,
  useDetailShortcuts,
} from '../lib'
import { AssignMenu } from './assign-menu'

const BANNER_DOT = {
  ok: 'bg-severity-resolved',
  info: 'bg-severity-info',
  warn: 'bg-severity-warning',
} as const

export function DetailHeader({ item, status, actions, banner }: DetailHeaderProps) {
  useDetailShortcuts(actions)
  const dot = banner ? BANNER_DOT[banner.tone] : SEVERITY_BG[item.severity]

  return (
    <header className="flex flex-col gap-3 border-border border-b px-8 pt-5 pb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 text-[12px] text-muted-foreground">
          {item.repository ? (
            <Link
              to="."
              search={(prev) => ({ ...prev, scope: item.repository ?? undefined })}
              title={`Show only ${item.repository}`}
              className="flex min-w-0 items-center gap-1.5 truncate transition-colors hover:text-foreground"
            >
              <IconBrandGithub className="size-3.5 shrink-0" stroke={1.75} />
              <span className="truncate">{item.repository}</span>
            </Link>
          ) : (
            <span className="truncate">{item.scopeLabel}</span>
          )}
          <span className="text-faint">/</span>
          <span className="shrink-0 font-mono">{item.handle}</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={actions.onSecondary} title="s">
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
      </div>

      <h2 className="m-0 font-semibold text-[20px] leading-7 tracking-[-0.015em] text-pretty">
        {item.title}
      </h2>

      <div className="flex flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2 text-[13px]">
          <span className={cn('size-2 shrink-0 rounded-full', dot)} />
          <span className="truncate font-medium">{banner ? banner.message : stateLine(item)}</span>
          {banner?.meta && <span className="shrink-0 text-muted-foreground">· {banner.meta}</span>}
        </div>
        <span className="truncate pl-4 font-mono text-[12px] text-muted-foreground">
          {item.subtitle}
        </span>
      </div>
    </header>
  )
}
