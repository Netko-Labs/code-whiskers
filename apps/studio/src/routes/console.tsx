import { Spinner } from '@code-whiskers/ui/components/spinner'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ConsoleShell } from '@/components/console'
import { useRequireSession } from '@/integrations/auth'

function ConsoleLayout() {
  const guard = useRequireSession()

  return (
    <ConsoleShell>
      {guard === 'authenticated' ? (
        <Outlet />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="size-5 text-muted-foreground" />
        </div>
      )}
    </ConsoleShell>
  )
}

export const Route = createFileRoute('/console')({
  head: () => ({ meta: [{ title: 'Console · CodeWhiskers' }] }),
  component: ConsoleLayout,
})
