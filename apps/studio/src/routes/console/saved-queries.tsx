import { createFileRoute } from '@tanstack/react-router'
import { SavedQueriesPage } from '@/components/console/telemetry'

export const Route = createFileRoute('/console/saved-queries')({
  component: SavedQueriesPage,
})
