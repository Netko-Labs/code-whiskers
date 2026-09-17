import { createFileRoute } from '@tanstack/react-router'
import { TriageView } from '@/components/console'
import { parseTriageBucket, parseTriageSearch } from '@/components/console/shared/console-routing'

function TriagePage() {
  const { bucket } = Route.useParams()
  const { sel, filter } = Route.useSearch()

  return <TriageView bucket={parseTriageBucket(bucket)} filter={filter} selectedId={sel} />
}

export const Route = createFileRoute('/console/triage/$bucket')({
  validateSearch: parseTriageSearch,
  component: TriagePage,
})
