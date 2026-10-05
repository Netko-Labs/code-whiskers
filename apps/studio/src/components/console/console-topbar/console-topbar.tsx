import { IconHelpCircle } from '@tabler/icons-react'
import { ConsoleNotifications } from '../console-nav'
import { useConsoleStore } from '../use-console-store'
import { ConsoleBreadcrumbs } from './console-breadcrumbs'
import { TOPBAR_BUTTON, useBreadcrumbs } from './lib'

/** Stable across renders so the slot registers once, not on every paint. */
function registerActionsSlot(slot: HTMLDivElement | null): void {
  useConsoleStore.getState().setActionsSlot(slot)
}

export function ConsoleTopbar() {
  const crumbs = useBreadcrumbs()

  return (
    <header className="flex h-topbar shrink-0 items-center gap-2 border-border border-b px-3 pl-gutter">
      <ConsoleBreadcrumbs crumbs={crumbs} />
      <div ref={registerActionsSlot} className="ml-auto flex min-w-0 items-center gap-1.5" />
      <ConsoleNotifications className="hover:bg-surface-hover" />
      <button
        type="button"
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts  ?"
        onClick={() => useConsoleStore.getState().setShortcutsOpen(true)}
        className={TOPBAR_BUTTON}
      >
        <IconHelpCircle className="size-4" stroke={1.75} />
      </button>
    </header>
  )
}
