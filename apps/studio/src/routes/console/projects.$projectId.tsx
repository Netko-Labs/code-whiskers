import { createFileRoute } from '@tanstack/react-router'
import { ProjectSettingsPage } from '@/components/console'

function ProjectSettingsRoute() {
  const { projectId } = Route.useParams()
  return <ProjectSettingsPage key={projectId} projectId={projectId} />
}

export const Route = createFileRoute('/console/projects/$projectId')({
  component: ProjectSettingsRoute,
})
