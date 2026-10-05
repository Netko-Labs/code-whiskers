import { createFileRoute } from '@tanstack/react-router'
import { ProjectSetupPage, parseSetupSearch } from '@/components/console'

function ProjectSetupRoute() {
  const search = Route.useSearch()
  return <ProjectSetupPage search={search} />
}

export const Route = createFileRoute('/console/projects/new')({
  head: () => ({ meta: [{ title: 'New project · CodeWhiskers' }] }),
  validateSearch: parseSetupSearch,
  component: ProjectSetupRoute,
})
