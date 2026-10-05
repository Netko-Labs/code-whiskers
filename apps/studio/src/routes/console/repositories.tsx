import { createFileRoute } from '@tanstack/react-router'
import { RepositoriesPage } from '@/components/console/code-review'

export const Route = createFileRoute('/console/repositories')({
  component: RepositoriesPage,
})
