import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/console/settings/')({
  beforeLoad: () => {
    throw redirect({ to: '/console/settings/general', replace: true })
  },
})
