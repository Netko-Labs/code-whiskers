import { useCallback } from 'react'
import { useWindowResize } from '@/shared/dom-events'
import { ConsoleNav, ConsoleRail } from '../console-nav'
import { useConsoleStore } from '../use-console-store'
import { ConsoleToast } from './console-toast'
import type { ConsoleShellProps } from './lib'

export function ConsoleShell({ children }: ConsoleShellProps) {
  const navOpen = useConsoleStore((s) => s.navOpen)
  const collapse = useCallback(() => useConsoleStore.getState().collapseNavOnNarrow(), [])
  useWindowResize(collapse)

  return (
    <div className="relative flex h-dvh overflow-hidden bg-background font-sans text-foreground">
      {navOpen ? <ConsoleNav /> : <ConsoleRail />}
      <div className="relative flex min-w-0 flex-1">
        {children}
        <ConsoleToast />
      </div>
    </div>
  )
}
