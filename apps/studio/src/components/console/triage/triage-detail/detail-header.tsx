import { Button, buttonVariants } from '@code-whiskers/ui/components/button'
import { IconBrandGithub, IconExternalLink } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { SeverityDot } from '@/components/shared/status'
import { AssignMenu } from '../../shared/assign-menu'
import { SEVERITY_TONE } from '../../shared/console-data'
import { type DetailHeaderProps, primaryLabel, secondaryLabel, useDetailShortcuts } from '../lib'

export function DetailHeader({ item, status, actions, banner }: DetailHeaderProps) {
  useDetailShortcuts(actions)

  return (
    <header className="flex shrink-0 flex-col gap-3 border-border border-b px-8 pt-5 pb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 text-2xs text-muted-foreground">
          {item.repository ? (
            <Link
              to="."
              search={(prev) => ({ ...prev, scope: item.repository ?? undefined })}
              title={`Show only ${item.repository}`}
              className="focus-ring flex min-w-0 items-center gap-1.5 truncate rounded-sm transition-colors hover:text-foreground"
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
        <div className="flex shrink-0 items-center gap-2">
          {item.kind === 'review' && item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              GitHub
              <IconExternalLink data-icon="inline-end" />
            </a>
          )}
          <AssignMenu
            assigneeUserId={status.assigneeUserId}
            isDisabled={!item.triage}
            onAssign={actions.assignTo}
          />
          <Button variant="outline" size="sm" onClick={actions.snooze} title="s">
            {secondaryLabel(status)}
          </Button>
          <Button size="sm" onClick={actions.done} title="e">
            {primaryLabel(status)}
          </Button>
        </div>
      </div>

      <h2 className="m-0 font-semibold text-foreground text-title text-pretty">{item.title}</h2>

      <div className="flex flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2 text-ui">
          <SeverityDot tone={banner ? banner.tone : SEVERITY_TONE[item.severity]} />
          <span className="truncate font-medium">{banner ? banner.message : item.label}</span>
          {banner?.meta && <span className="shrink-0 text-muted-foreground">· {banner.meta}</span>}
        </div>
        <span className="truncate pl-4 font-mono text-2xs text-muted-foreground">
          {item.subtitle}
        </span>
      </div>
    </header>
  )
}
