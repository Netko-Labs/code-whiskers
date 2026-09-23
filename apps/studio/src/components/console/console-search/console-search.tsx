import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@code-whiskers/ui/components/command'
import { useConsoleStore } from '../use-console-store'
import { useSearchEntries, useSearchShortcut } from './lib'

export function ConsoleSearch() {
  const isOpen = useConsoleStore((s) => s.isSearchOpen)
  const entries = useSearchEntries()
  useSearchShortcut()
  const groups = [...new Set(entries.map((entry) => entry.group))]

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(next) => useConsoleStore.getState().setSearchOpen(next)}
      title="Search"
      description="Jump to a triage item or a section"
    >
      <CommandInput placeholder="Search items and sections…" />
      <CommandList>
        <CommandEmpty>Nothing matches.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group} heading={group}>
            {entries
              .filter((entry) => entry.group === group)
              .map((entry) => (
                <CommandItem
                  key={entry.id}
                  value={`${entry.label} ${entry.hint}`}
                  onSelect={entry.onSelect}
                >
                  <span className="truncate">{entry.label}</span>
                  {entry.hint && (
                    <span className="ml-auto truncate font-mono text-[11px] text-muted-foreground">
                      {entry.hint}
                    </span>
                  )}
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
