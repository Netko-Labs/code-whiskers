import { ErrorState } from '@/components/shared/empty-state'
import { formatCompact, StatCard, StatGrid } from '@/components/shared/stats'
import { type OverviewStatsProps, statsFor } from './lib'

export function OverviewStats({ range, data, signals }: OverviewStatsProps) {
  if (data.isError) {
    return (
      <ErrorState
        size="inline"
        title="The numbers did not load"
        description="Whiskers did not answer for the overview. Check WHISKERS_URL and the worker logs."
        onRetry={data.retry}
      />
    )
  }

  return (
    <StatGrid>
      {statsFor(range, data.overview, signals).map((stat) => (
        <StatCard
          key={stat.key}
          label={stat.label}
          value={stat.value}
          format={stat.isCompact ? formatCompact : undefined}
          hint={stat.hint}
          trend={stat.trend}
          tone={stat.tone}
          isLoading={data.isLoading || (signals.isLoading && !stat.trend)}
        />
      ))}
    </StatGrid>
  )
}
