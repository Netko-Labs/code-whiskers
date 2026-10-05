import { CommandPalette } from '../command-palette'
import { ConsoleRail, ConsoleSidebar } from '../console-nav'
import { ConsoleTopbar } from '../console-topbar'
import { ShortcutsSheet } from '../shortcuts-sheet'
import { useConsoleStore } from '../use-console-store'
import { ConsoleToast } from './console-toast'
import { type ConsoleShellProps, useShellEffects } from './lib'

/**
 * Sidebar on the canvas, the page in an inset panel beside it. Below `lg` the rail is the nav.
 * Only the page body carries the `page` view-transition name, so route changes leave chrome still.
 */
export function ConsoleShell({ children }: ConsoleShellProps) {
  const isNavCollapsed = useConsoleStore((s) => s.isNavCollapsed)
  useShellEffects()

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas font-sans text-foreground">
      {isNavCollapsed ? (
        <ConsoleRail />
      ) : (
        <>
          <ConsoleSidebar />
          <ConsoleRail className="lg:hidden" />
        </>
      )}
      <div className="flex min-w-0 flex-1 flex-col py-2 pr-2">
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-panel">
          <ConsoleTopbar />
          <div className="relative flex min-h-0 min-w-0 flex-1 [view-transition-name:page]">
            {children}
          </div>
          <ConsoleToast />
        </main>
      </div>
      <CommandPalette />
      <ShortcutsSheet />
    </div>
  )
}
