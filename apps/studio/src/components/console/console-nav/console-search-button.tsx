import { IconSearch } from '@tabler/icons-react'
import { Shortcut } from '@/components/shared/kbd'
import { useConsoleStore } from '../use-console-store'

export function ConsoleSearchButton() {
  return (
    <button
      type="button"
      onClick={() => useConsoleStore.getState().setPaletteOpen(true)}
      className="focus-ring flex h-8 w-full items-center gap-2 rounded-md border border-border bg-background px-2 text-left text-muted-foreground text-ui shadow-raised transition-colors hover:border-rule-strong hover:text-foreground"
    >
      <IconSearch className="size-4 shrink-0" stroke={1.75} />
      <span className="flex-1 truncate">Search or jump to…</span>
      <Shortcut keys={['mod', 'k']} />
    </button>
  )
}
