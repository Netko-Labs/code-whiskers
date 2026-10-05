import { Button } from '@code-whiskers/ui/components/button'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '@/components/shared/empty-state'
import { LiveDot } from '@/components/shared/status'
import { whiskersServicesQuery } from '@/integrations/whiskers'
import { OtlpSetup } from '../../shared/otlp-setup'
import type { ExplorerPartProps } from '../lib'

/** Nothing ever sent leads to setup; a quiet window or a narrow filter says so and offers a way out. */
export function LogsEmpty({ explorer }: ExplorerPartProps) {
  const { data: services, isPending } = useQuery({
    ...whiskersServicesQuery(explorer.filter.projectIds),
    retry: false,
  })
  const hasLogged = (services ?? []).some((service) => service.logs > 0)

  if (isPending) return null
  if (!hasLogged && !explorer.isFiltered) {
    return (
      <OtlpSetup
        title="No logs yet"
        description="Point an OpenTelemetry log exporter at this console and lines stream in here as they arrive."
      />
    )
  }
  if (explorer.isFiltered) {
    return (
      <EmptyState
        size="inline"
        expression="sleeping"
        title="No lines match"
        description="Nothing in this window passes every filter."
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              explorer.update({
                q: undefined,
                service: undefined,
                levels: undefined,
                attrs: undefined,
                traceId: undefined,
              })
            }
          >
            Clear filters
          </Button>
        }
      />
    )
  }
  if (explorer.isLive) {
    return (
      <EmptyState
        size="inline"
        expression="sleeping"
        title="Waiting for lines"
        description={<LiveDot label="New lines appear here the moment they arrive" />}
      />
    )
  }
  return (
    <EmptyState
      size="inline"
      expression="sleeping"
      title="No lines in this window"
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => explorer.update({ range: '7d', from: undefined, to: undefined })}
        >
          Show the last 7 days
        </Button>
      }
    />
  )
}
