import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SettingsLayout } from '@/components/console'

function SettingsRoute() {
  return (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  )
}

export const Route = createFileRoute('/console/settings')({
  head: () => ({ meta: [{ title: 'Settings · CodeWhiskers' }] }),
  component: SettingsRoute,
})
