import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { cn } from '@code-whiskers/ui/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { VIEWER } from '../shared/console-data'
import { useConsoleStore } from '../use-console-store'
import { USER_MENU } from './lib'
import { ThemePicker } from './theme-picker'

export function ConsoleUserMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function activate(entry: (typeof USER_MENU)[number]) {
    setOpen(false)
    if (entry.section) {
      navigate({ to: '/console/$section', params: { section: entry.section } })
      return
    }
    useConsoleStore.getState().flash(entry.label)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2.5 rounded-[9px] px-2 py-1.5 transition-colors hover:bg-zinc-800 aria-expanded:bg-zinc-800">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-50 font-semibold text-[10px] text-zinc-950">
          {VIEWER.initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col text-left">
          <span className="truncate font-medium text-xs text-zinc-50">{VIEWER.name}</span>
          <span className="truncate text-[11px] text-zinc-500">{VIEWER.email}</span>
        </div>
        <span className="shrink-0 text-[10px] text-zinc-500">⌄</span>
      </PopoverTrigger>

      <PopoverContent align="start" side="top" sideOffset={8} className="w-[272px] gap-0 p-1.5">
        <div className="flex items-center gap-2.5 px-2.5 pt-2.5 pb-3">
          <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-foreground font-semibold text-primary-foreground text-xs">
            {VIEWER.initials}
          </span>
          <div className="flex min-w-0 flex-col gap-px">
            <span className="font-semibold text-[13px]">{VIEWER.name}</span>
            <span className="truncate text-[11px] text-muted-foreground">{VIEWER.email}</span>
          </div>
        </div>

        <ThemePicker />

        <div className="mt-1 mb-1 h-px bg-rule-soft" />

        {USER_MENU.map((entry) => {
          const Icon = entry.icon
          return (
            <button
              type="button"
              key={entry.label}
              onClick={() => activate(entry)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left hover:bg-rule-soft"
            >
              <Icon
                className={cn(
                  'size-[15px] shrink-0',
                  entry.danger ? 'text-severity-error' : 'text-body',
                )}
                stroke={1.75}
              />
              <span
                className={cn(
                  'flex-1 text-[13px]',
                  entry.danger ? 'text-severity-error' : 'text-body',
                )}
              >
                {entry.label}
              </span>
              <span className="font-mono text-[11px] text-faint">{entry.kbd}</span>
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
