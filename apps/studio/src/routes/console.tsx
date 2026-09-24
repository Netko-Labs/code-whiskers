import { Spinner } from '@code-whiskers/ui/components/spinner'
import { createFileRoute, Outlet, retainSearchParams } from '@tanstack/react-router'
import { ConsoleShell } from '@/components/console'
import { parseConsoleScope } from '@/components/console/shared/console-routing'
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
  validateSearch: parseConsoleScope,
  search: { middlewares: [retainSearchParams(['scope'])] },
  component: ConsoleLayout,
})
