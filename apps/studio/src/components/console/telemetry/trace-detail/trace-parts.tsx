import { buttonVariants } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconScript } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Panel } from '@/components/shared/page'
import { SeverityDot } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { type ServiceLegendProps, serviceFill, type TraceRelatedProps } from './lib'

export function ServiceLegend({ services }: ServiceLegendProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted-foreground">
      {services.map((service, index) => (
        <span key={service} className="flex items-center gap-1.5">
          <span aria-hidden className={cn('size-2 rounded-[3px]', serviceFill(index))} />
          <span className="font-mono">{service}</span>
        </span>
      ))}
    </div>
  )
}

/** The logs this trace wrote and the errors it raised, one click from the waterfall. */
export function TraceRelatedLink({ traceId, context, window }: TraceRelatedProps) {
  const logs = context?.logs
  return (
    <Link
      to="/console/live-logs"
      search={{ traceId, from: window.from, to: window.to }}
      className={buttonVariants({ size: 'sm', variant: 'outline' })}
    >
      <IconScript className="size-3.5" stroke={1.75} />
      Logs
      {logs !== undefined && (
        <span className="font-mono text-2xs text-muted-foreground tabular-nums">{logs}</span>
      )}
    </Link>
  )
}

export function TraceErrors({ context }: Pick<TraceRelatedProps, 'context'>) {
  const errors = context?.errors ?? []
  if (errors.length === 0) return null

  return (
    <Panel
      title="Errors in this trace"
      description="Events whose SDK reported this trace id"
      isFlush
      className="animate-enter-up"
    >
      <ul className="m-0 flex list-none flex-col p-0">
        {errors.map((error) => (
          <li key={error.eventId} className="border-rule-soft border-b last:border-b-0">
            <Link
              to="/console/issues/$issueId"
              params={{ issueId: error.issueId }}
              className="focus-ring-inset flex h-row items-center gap-3 px-4 text-ui transition-colors hover:bg-surface-hover"
            >
              <SeverityDot tone="error" label={error.level} />
              <span className="min-w-0 flex-1 truncate">{error.title}</span>
              <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                {formatAge(error.receivedAt)} ago
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
