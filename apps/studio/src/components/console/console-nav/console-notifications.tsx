import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconBell } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { SeverityDot } from '../shared/console-ui'
import { useConsoleStore } from '../use-console-store'
import { useNotifications } from './lib'

export function ConsoleNotifications({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { notes, unreadIds } = useNotifications()

  function openItem(itemId: string) {
    setOpen(false)
    useConsoleStore.getState().markRead(itemId)
    navigate({
      to: '/console/triage/$bucket',
      params: { bucket: 'inbox' },
      search: { sel: itemId },
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn('relative', className)} aria-label="Notifications">
        <IconBell className="size-[15px]" stroke={1.75} />
        {unreadIds.size > 0 && (
          <span className="absolute top-1 right-1 size-1.5 rounded-full border-[1.5px] border-zinc-950 bg-severity-error" />
        )}
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={8} className="w-[286px] gap-0 p-1.5">
        <div className="flex items-center justify-between px-2.5 pt-[7px] pb-1.5">
          <span className="text-[11px] text-muted-foreground">Notifications</span>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              useConsoleStore.getState().markAllRead(notes.map((note) => note.itemId))
            }}
            className="text-[11px] text-body underline"
          >
            Mark all as read
          </button>
        </div>
        {notes.length === 0 && (
          <span className="px-2.5 py-2 text-[13px] text-muted-foreground">
            Nothing needs you from the last week.
          </span>
        )}
        {notes.map((note) => {
          const isUnread = unreadIds.has(note.itemId)
          return (
            <button
              type="button"
              key={note.itemId}
              onClick={() => openItem(note.itemId)}
              className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-rule-soft"
            >
              <SeverityDot
                severity={isUnread ? note.severity : 'idle'}
                size="sm"
                className="mt-1.5"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                  className={cn(
                    'text-[13px] leading-[18px] text-pretty',
                    isUnread ? 'font-semibold' : 'font-normal',
                  )}
                >
                  {note.title}
                </span>
                <span className="text-[11px] text-muted-foreground">{note.when}</span>
              </div>
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
