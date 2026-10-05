import { Button } from '@code-whiskers/ui/components/button'
import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { IconRefresh } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Panel, SettingRow } from '@/components/shared/page'
import { StatusBadge } from '@/components/shared/status'
import { instanceHealthQuery, instanceQuery } from '@/integrations/studio-api'
import { formatAge } from '@/shared/format-date'
import { HEALTH_DETAIL, HEALTH_LABEL, HEALTH_TONE } from './lib'

/** Studio answered this page, so it is up; the worker gets an honest round trip. */
export function InstanceHealth() {
  const health = useQuery({ ...instanceHealthQuery(), retry: false })
  const { data: instance } = useQuery({ ...instanceQuery(), retry: false })
  const worker = health.data

  return (
    <Panel
      title="Health"
      description={
        worker ? `Checked ${formatAge(worker.checkedAt)} ago · every 30s` : 'Checked every 30s'
      }
      actions={
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Check again"
          title="Check again"
          disabled={health.isFetching}
          onClick={() => void health.refetch()}
        >
          <IconRefresh className={health.isFetching ? 'animate-spin' : undefined} stroke={1.75} />
        </Button>
      }
      isFlush
    >
      <SettingRow label="Studio" description="Console, auth and the public API — serving this page">
        <StatusBadge tone="resolved">Up</StatusBadge>
        {instance?.release && (
          <span className="font-mono text-2xs text-muted-foreground">{instance.release}</span>
        )}
      </SettingRow>
      <SettingRow
        label="Whiskers worker"
        description={worker ? HEALTH_DETAIL[worker.status] : 'Reviews, ingest and /v1 insights'}
      >
        {worker ? (
          <>
            <StatusBadge tone={HEALTH_TONE[worker.status]}>
              {HEALTH_LABEL[worker.status]}
            </StatusBadge>
            {worker.latencyMs !== null && (
              <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                {worker.latencyMs} ms
              </span>
            )}
            {worker.release && (
              <span className="font-mono text-2xs text-muted-foreground">{worker.release}</span>
            )}
          </>
        ) : health.isError ? (
          <StatusBadge tone="neutral">Unknown</StatusBadge>
        ) : (
          <Skeleton className="h-5 w-24 rounded-full" />
        )}
      </SettingRow>
    </Panel>
  )
}
