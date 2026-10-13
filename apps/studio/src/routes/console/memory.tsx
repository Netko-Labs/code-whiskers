import { createFileRoute } from '@tanstack/react-router'
import { MemoryPage } from '@/components/console/code-review'

export const Route = createFileRoute('/console/memory')({
  component: MemoryPage,
})
