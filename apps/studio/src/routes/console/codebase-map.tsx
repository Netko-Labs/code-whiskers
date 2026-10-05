import { createFileRoute } from '@tanstack/react-router'
import { CodebaseMapPage } from '@/components/console/code-review'

export const Route = createFileRoute('/console/codebase-map')({
  component: CodebaseMapPage,
})
