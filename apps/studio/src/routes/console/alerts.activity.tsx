import { createFileRoute } from '@tanstack/react-router'
import { AlertsPage } from '@/components/console'

export const Route = createFileRoute('/console/alerts/activity')({
  head: () => ({ meta: [{ title: 'Alert activity · CodeWhiskers' }] }),
  component: () => <AlertsPage tab="activity" />,
})
