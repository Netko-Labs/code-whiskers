import { cn } from '@code-whiskers/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { SeverityDot } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { formatDuration, formatStamp } from '../shared/telemetry-time'
import { durationBar, TRACE_GRID, type TraceRowProps } from './lib'

const NUMBER = 'text-right font-mono text-xs tabular-nums'

/** Root operation, its service, wall time against p95 (the tick), spans, errors, age. */
export function TraceRow({ trace, scaleMs, p95Ms }: TraceRowProps) {
  const bar = durationBar(trace.durationMs, scaleMs, p95Ms)
  const hasErrors = trace.errors > 0

  return (
    <div role="listitem" className="min-w-0">
      <Link
        to="/console/traces/$traceId"
        params={{ traceId: trace.traceId }}
        data-slot="data-row"
        className={cn(
          'group/row focus-ring-inset relative grid min-h-row items-center gap-x-4 border-rule-soft border-b px-gutter py-1.5 text-ui transition-colors duration-fast hover:bg-surface-hover',
          'before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full',
          hasErrors ? 'before:bg-severity-error' : 'before:bg-transparent',
          TRACE_GRID,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-foreground">{trace.rootName}</span>
          <span className="hidden shrink-0 font-mono text-2xs text-faint xl:inline">
            {trace.traceId.slice(0, 8)}
          </span>
        </span>
        <span className="truncate font-mono text-muted-foreground text-xs">
          {trace.rootService}
        </span>
        <span className="flex items-center gap-2">
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-[width] duration-slow ease-out-quart',
                hasErrors ? 'bg-severity-error' : bar.isSlow ? 'bg-severity-warning' : 'bg-chart-1',
              )}
              style={{ width: `${bar.percent}%` }}
            />
            {p95Ms > 0 && (
              <span
                aria-hidden
                className="absolute inset-y-0 w-px bg-foreground/40"
                style={{ left: `${bar.p95Percent}%` }}
              />
            )}
          </span>
          <span className={cn(NUMBER, 'w-14 text-foreground')}>
            {formatDuration(trace.durationMs)}
          </span>
        </span>
        <span className={cn(NUMBER, 'text-muted-foreground')}>{trace.spans}</span>
        <span className={cn(NUMBER, 'flex items-center justify-end gap-1.5')}>
          {hasErrors ? (
            <>
              <SeverityDot tone="error" size="sm" />
              <span className="text-severity-error-ink">{trace.errors}</span>
            </>
          ) : (
            <span className="text-faint">0</span>
          )}
        </span>
        <time
          dateTime={trace.startedAt.toISOString()}
          title={formatStamp(trace.startedAt)}
          className={cn(NUMBER, 'text-muted-foreground')}
        >
          {formatAge(trace.startedAt)}
        </time>
      </Link>
    </div>
  )
}
