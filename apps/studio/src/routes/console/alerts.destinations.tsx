import { createFileRoute } from '@tanstack/react-router'
import { AlertsPage } from '@/components/console'

export const Route = createFileRoute('/console/alerts/destinations')({
  head: () => ({ meta: [{ title: 'Destinations · CodeWhiskers' }] }),
  component: () => <AlertsPage tab="destinations" />,
})
