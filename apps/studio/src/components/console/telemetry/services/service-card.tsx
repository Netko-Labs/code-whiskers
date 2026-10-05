import { buttonVariants } from '@code-whiskers/ui/components/button'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconGitCommit, IconScript } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { formatCompact, Sparkline } from '@/components/shared/stats'
import { SeverityDot } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { formatDuration } from '../shared/telemetry-time'
import {
  errorRate,
  formatPercent,
  formatRate,
  healthTone,
  perMinute,
  type ServiceCardProps,
  type ServiceMetricProps,
  seriesOf,
} from './lib'

const LINK = cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-7 px-2 text-2xs')

function ServiceMetric({ label, value, hint, values, tone, variant }: ServiceMetricProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 px-4 py-3">
      <span className="text-2xs text-muted-foreground">{label}</span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-mono font-semibold text-foreground text-ui tabular-nums">
          {value}
        </span>
        {hint && <span className="text-2xs text-faint">{hint}</span>}
      </span>
      <Sparkline
        values={values}
        variant={variant}
        tone={tone}
        width={120}
        height={22}
        className="w-full"
      />
    </div>
  )
}

/** One service: request rate, error rate and latency over the window, with doors into its data. */
export function ServiceCard({ stats, windowMs, search }: ServiceCardProps) {
  const series = seriesOf(stats)
  const tone = healthTone(stats)
  const rate = errorRate(stats)
  const hasRequests = stats.requests > 0
  const range = { range: search.range, from: search.from, to: search.to }

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-border bg-card transition-shadow duration-base hover:shadow-raised">
      <header className="flex items-center justify-between gap-3 border-border border-b px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <SeverityDot tone={tone} label={tone === 'neutral' ? undefined : 'Failing requests'} />
          <h2 className="m-0 truncate font-mono font-semibold text-foreground text-ui">
            {stats.service}
          </h2>
          {stats.lastSeen && (
            <span className="shrink-0 font-mono text-2xs text-faint">
              {formatAge(stats.lastSeen)} ago
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Link
            to="/console/live-logs"
            search={{ service: stats.service, ...range }}
            className={LINK}
          >
            <IconScript className="size-3.5" stroke={1.75} />
            Logs
          </Link>
          <Link to="/console/traces" search={{ service: stats.service, ...range }} className={LINK}>
            <IconGitCommit className="size-3.5" stroke={1.75} />
            Traces
          </Link>
        </div>
      </header>
      {hasRequests ? (
        <div className="grid grid-cols-2 divide-rule-soft sm:grid-cols-4 sm:divide-x">
          <ServiceMetric
            label="Requests"
            value={formatRate(perMinute(stats.requests, windowMs))}
            hint="/min"
            values={series.requests}
            tone="info"
            variant="bars"
          />
          <ServiceMetric
            label="Error rate"
            value={formatPercent(rate)}
            hint={stats.errors ? `${formatCompact(stats.errors)} failed` : undefined}
            values={series.errors}
            tone={stats.errors ? 'error' : 'neutral'}
            variant="bars"
          />
          <ServiceMetric
            label="p50"
            value={stats.p50Ms === null ? '—' : formatDuration(stats.p50Ms)}
            values={series.p50}
            tone="info"
            variant="line"
          />
          <ServiceMetric
            label="p95"
            value={stats.p95Ms === null ? '—' : formatDuration(stats.p95Ms)}
            values={series.p95}
            tone="info"
            variant="line"
          />
        </div>
      ) : (
        <p className="m-0 px-4 py-4 text-muted-foreground text-ui">
          Only logs so far. Export spans from this service to see its request rate and latency.
        </p>
      )}
      <footer className="flex items-center gap-3 border-rule-soft border-t px-4 py-2 font-mono text-2xs text-muted-foreground tabular-nums">
        <span>{formatCompact(stats.requests)} requests</span>
        <span>{formatCompact(stats.logs)} log lines</span>
        {stats.logErrors > 0 && (
          <span className="text-severity-error-ink">
            {formatCompact(stats.logErrors)} error lines
          </span>
        )}
      </footer>
    </article>
  )
}
