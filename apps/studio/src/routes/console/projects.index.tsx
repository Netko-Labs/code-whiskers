import { createFileRoute } from '@tanstack/react-router'
import { ProjectsIndexPage } from '@/components/console'

export const Route = createFileRoute('/console/projects/')({
  head: () => ({ meta: [{ title: 'Projects · CodeWhiskers' }] }),
  component: ProjectsIndexPage,
})
