import { createFileRoute } from '@tanstack/react-router'
import { AlertsPage } from '@/components/console'

export const Route = createFileRoute('/console/alerts/')({
  head: () => ({ meta: [{ title: 'Alerts · CodeWhiskers' }] }),
  component: () => <AlertsPage tab="rules" />,
})
