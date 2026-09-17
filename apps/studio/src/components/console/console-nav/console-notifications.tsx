import { Popover, PopoverContent, PopoverTrigger } from '@code-whiskers/ui/components/popover'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconBell } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { NOTIFICATIONS } from '../shared/console-data'
import { SeverityDot } from '../shared/console-ui'
import { useConsoleStore } from '../use-console-store'

export function ConsoleNotifications({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const readAll = useConsoleStore((s) => s.readAll)
  const unread = !readAll && NOTIFICATIONS.some((note) => note.unread)

  function openItem(itemId: string) {
    setOpen(false)
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
        {unread && (
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
              const { markAllRead, flash } = useConsoleStore.getState()
              markAllRead()
              flash('All notifications marked as read')
            }}
            className="text-[11px] text-body underline"
          >
            Mark all as read
          </button>
        </div>
        {NOTIFICATIONS.map((note) => (
          <button
            type="button"
            key={note.title}
            onClick={() => openItem(note.itemId)}
            className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-rule-soft"
          >
            <SeverityDot severity={readAll ? 'idle' : note.severity} size="sm" className="mt-1.5" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className={cn(
                  'text-[13px] leading-[18px] text-pretty',
                  readAll || !note.unread ? 'font-normal' : 'font-semibold',
                )}
              >
                {note.title}
              </span>
              <span className="text-[11px] text-muted-foreground">{note.when}</span>
            </div>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
