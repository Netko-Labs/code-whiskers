import { createFileRoute } from '@tanstack/react-router'
import { parseTraceDetailSearch, TraceDetailPage } from '@/components/console/telemetry'

function TraceRoute() {
  const { traceId } = Route.useParams()
  const { span } = Route.useSearch()
  return <TraceDetailPage key={traceId} traceId={traceId} spanId={span} />
}

export const Route = createFileRoute('/console/traces/$traceId')({
  validateSearch: parseTraceDetailSearch,
  component: TraceRoute,
})
