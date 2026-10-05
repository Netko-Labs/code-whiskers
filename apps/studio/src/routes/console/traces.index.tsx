import { createFileRoute } from '@tanstack/react-router'
import { parseTraceSearch, TracesPage } from '@/components/console/telemetry'

function TracesRoute() {
  return <TracesPage search={Route.useSearch()} />
}

export const Route = createFileRoute('/console/traces/')({
  validateSearch: parseTraceSearch,
  component: TracesRoute,
})
