import { createFileRoute } from '@tanstack/react-router'
import { parseRangeSearch, ServicesPage } from '@/components/console/telemetry'

function ServicesRoute() {
  return <ServicesPage search={Route.useSearch()} />
}

export const Route = createFileRoute('/console/services')({
  validateSearch: parseRangeSearch,
  component: ServicesRoute,
})
