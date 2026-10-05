import { createFileRoute } from '@tanstack/react-router'
import { LogsExplorer, parseLogSearch } from '@/components/console/telemetry'

function LiveLogsRoute() {
  return <LogsExplorer search={Route.useSearch()} />
}

export const Route = createFileRoute('/console/live-logs')({
  validateSearch: parseLogSearch,
  component: LiveLogsRoute,
})
