import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@code-whiskers/ui/components/command'
import { useState } from 'react'
import { Shortcut } from '@/components/shared/kbd'
import { useConsoleStore } from '../use-console-store'
import { groupCommands, PALETTE_PLACEHOLDER, usePaletteCommands } from './lib'

export function CommandPalette() {
  const isOpen = useConsoleStore((s) => s.isPaletteOpen)
  const [query, setQuery] = useState('')
  const commands = usePaletteCommands(query)

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(next) => {
        useConsoleStore.getState().setPaletteOpen(next)
        if (!next) setQuery('')
      }}
      title="Command menu"
      description="Search issues, jump to a page or run an action"
    >
      <Command loop className="rounded-none! bg-transparent p-0">
        <CommandInput value={query} onValueChange={setQuery} placeholder={PALETTE_PLACEHOLDER} />
        <CommandList className="py-1">
          <CommandEmpty>Nothing matches “{query}”.</CommandEmpty>
          {groupCommands(commands).map(({ group, commands: entries }) => (
            <CommandGroup key={group} heading={group}>
              {entries.map((command) => (
                <CommandItem
                  key={command.id}
                  value={command.id}
                  keywords={[command.label, command.hint ?? '', ...(command.keywords ?? [])]}
                  onSelect={command.run}
                >
                  <command.icon className="text-muted-foreground" stroke={1.75} />
                  <span className="min-w-0 truncate">{command.label}</span>
                  {command.hint && (
                    <span className="ml-auto min-w-0 truncate font-mono text-2xs text-muted-foreground">
                      {command.hint}
                    </span>
                  )}
                  {command.shortcut && (
                    <Shortcut keys={command.shortcut} className={command.hint ? '' : 'ml-auto'} />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="flex items-center gap-4 border-border border-t px-4 py-2 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Shortcut keys={['up']} />
            <Shortcut keys={['down']} />
            Move
          </span>
          <span className="flex items-center gap-1.5">
            <Shortcut keys={['enter']} />
            Open
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Shortcut keys={['escape']} />
            Close
          </span>
        </div>
      </Command>
    </CommandDialog>
  )
}
