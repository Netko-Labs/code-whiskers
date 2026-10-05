import { cn } from '@code-whiskers/ui/lib/utils'
import { IconExternalLink } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { LiveDot } from '@/components/shared/status'
import { formatAge, formatDateTime } from '@/shared/format-date'
import { shortRelease } from '../../shared/issue-lifecycle'
import { type DeployTimelineProps, META_LINK } from './lib'

/** Railway-style history: the active deploy leads, this release's stand out, the rest recede. */
export function DeployTimeline({ group }: DeployTimelineProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="m-0 font-semibold text-foreground text-ui">{group.environment}</h3>
      <ol className="stagger relative m-0 flex list-none flex-col p-0 before:absolute before:top-2 before:bottom-2 before:left-[3px] before:w-px before:bg-border">
        {group.deploys.map((deploy) => (
          <li
            key={deploy.id}
            className={cn(
              'relative flex min-w-0 items-center gap-3 py-1.5 pl-5 text-2xs transition-opacity duration-base',
              !deploy.isThisRelease && !deploy.isActive && 'opacity-55 hover:opacity-100',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'absolute top-1/2 left-0 size-[7px] -translate-y-1/2 rounded-full',
                deploy.isThisRelease ? 'bg-foreground' : 'border border-faint bg-background',
              )}
            />
            {deploy.isThisRelease ? (
              <span className="font-medium font-mono text-foreground">
                {shortRelease(deploy.version)}
              </span>
            ) : (
              <Link
                to="/console/releases/$version"
                params={{ version: deploy.version }}
                search={(previous) => ({ ...previous, tab: 'deploys' as const })}
                className={META_LINK}
              >
                {shortRelease(deploy.version)}
              </Link>
            )}
            {deploy.isActive && <LiveDot label="Active" />}
            {deploy.name && <span className="truncate text-muted-foreground">{deploy.name}</span>}
            <span
              className="ml-auto shrink-0 font-mono text-muted-foreground tabular-nums"
              title={formatDateTime(deploy.deployedAt)}
            >
              {formatAge(deploy.deployedAt)} ago
            </span>
            {deploy.url && (
              <a
                href={deploy.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open the ${group.environment} deploy`}
                className="focus-ring shrink-0 rounded-sm text-muted-foreground hover:text-foreground"
              >
                <IconExternalLink className="size-3.5" stroke={1.75} />
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
