import { createFileRoute } from '@tanstack/react-router'
import { parseReleaseSearch, ReleasePage } from '@/components/console'

function ReleaseRoute() {
  const { version } = Route.useParams()
  const { project, tab } = Route.useSearch()
  return (
    <ReleasePage key={`${project}:${version}`} version={version} projectId={project} tab={tab} />
  )
}

export const Route = createFileRoute('/console/releases/$version')({
  validateSearch: parseReleaseSearch,
  component: ReleaseRoute,
})
