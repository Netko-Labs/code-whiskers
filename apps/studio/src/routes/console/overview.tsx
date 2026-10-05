import { createFileRoute } from '@tanstack/react-router'
import { OverviewView, parseOverviewSearch } from '@/components/console'

function OverviewRoute() {
  const { range } = Route.useSearch()
  return <OverviewView range={range} />
}

export const Route = createFileRoute('/console/overview')({
  head: () => ({ meta: [{ title: 'Overview · CodeWhiskers' }] }),
  validateSearch: parseOverviewSearch,
  component: OverviewRoute,
})
