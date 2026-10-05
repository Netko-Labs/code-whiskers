import { ErrorState } from '@/components/shared/empty-state'
import { PanelSkeleton, Section } from '@/components/shared/page'
import { StatCard, StatGrid } from '@/components/shared/stats'
import { InstanceReviewer } from './instance-reviewer'
import { InstanceStorage } from './instance-storage'
import { formatBytes, formatSeconds, useInstanceUsage } from './lib'

/** Disk, throughput and reviewer spend: what a plan tier would have decided, shown instead. */
export function InstanceUsage() {
  const usage = useInstanceUsage()
  const activity = usage.worker?.activity
  const retention = usage.worker
    ? `Logs and spans go after ${usage.worker.telemetryRetentionDays} days, error events after ${usage.worker.errorEventRetentionDays}; reviews and issues are kept`
    : 'Whiskers did not answer; only studio tables are listed'

  return (
    <Section title="Usage" description="Counted from both databases each time this page loads">
      {usage.isError ? (
        <ErrorState
          size="inline"
          description="Neither database answered the storage query."
          onRetry={usage.retry}
        />
      ) : (
        <>
          <StatGrid>
            <StatCard
              label="On disk"
              value={usage.isLoading ? '' : formatBytes(usage.databaseBytes)}
              hint="both databases"
              isLoading={usage.isLoading}
            />
            <StatCard
              label="Reviews"
              value={activity?.reviews7d ?? '—'}
              hint={[
                'last 7 days',
                activity?.medianReviewSeconds != null &&
                  `median ${formatSeconds(activity.medianReviewSeconds)}`,
                activity?.failed7d && `${activity.failed7d} failed`,
              ]
                .filter(Boolean)
                .join(' · ')}
              isLoading={usage.isLoading}
            />
            <StatCard
              label="Error events"
              value={activity?.events24h ?? '—'}
              hint="last 24h"
              isLoading={usage.isLoading}
            />
            <StatCard
              label="In flight"
              value={activity?.inFlight ?? '—'}
              hint={activity?.inFlight ? 'reviews running' : 'worker idle'}
              isLoading={usage.isLoading}
            />
          </StatGrid>
          {usage.isLoading ? (
            <PanelSkeleton rows={6} />
          ) : (
            <InstanceStorage stores={usage.stores} retentionNote={retention} />
          )}
          {usage.worker?.reviewer && <InstanceReviewer reviewer={usage.worker.reviewer} />}
        </>
      )}
    </Section>
  )
}
