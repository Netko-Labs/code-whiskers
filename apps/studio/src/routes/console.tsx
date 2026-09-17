import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ConsoleShell } from '@/components/console'
import { useRequireSession } from '@/integrations/auth'

function ConsoleLayout() {
  useRequireSession()

  return (
    <ConsoleShell>
      <Outlet />
    </ConsoleShell>
  )
}

export const Route = createFileRoute('/console')({
  head: () => ({ meta: [{ title: 'Console · CodeWhiskers' }] }),
  component: ConsoleLayout,
})
