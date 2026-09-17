import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/')({
  beforeLoad: () => {
    throw redirect({ to: '/console/triage/$bucket', params: { bucket: 'inbox' } })
  },
})
