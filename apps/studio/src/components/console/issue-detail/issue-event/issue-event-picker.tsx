import { Button } from '@code-whiskers/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@code-whiskers/ui/components/dropdown-menu'
import { cn } from '@code-whiskers/ui/lib/utils'
import { IconChevronDown } from '@tabler/icons-react'
import { useState } from 'react'
import { formatAge } from '@/shared/format-date'
import { shortRelease } from '../../shared/issue-lifecycle'
import { type IssueEventPickerProps, useIssueEvents } from '../lib'

export function IssueEventPicker({ issue, currentId, onPick }: IssueEventPickerProps) {
  const [isOpen, setOpen] = useState(false)
  const { list, isLoading } = useIssueEvents(issue, isOpen)
  const events = list?.events ?? []

  return (
    <DropdownMenu open={isOpen} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={<Button variant="outline" size="xs" />}>
        All events
        <IconChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="max-h-80 w-auto min-w-80">
        {isLoading && (
          <span className="block px-2 py-1.5 text-muted-foreground text-xs">Reading events…</span>
        )}
        {!isLoading && events.length === 0 && (
          <span className="block px-2 py-1.5 text-muted-foreground text-xs">No events stored.</span>
        )}
        {events.map((event) => (
          <DropdownMenuItem
            key={event.id}
            onClick={() => onPick(event.id)}
            className={cn('flex-col items-start gap-0.5', event.id === currentId && 'bg-muted')}
          >
            <span className="flex w-full items-baseline gap-2 font-mono text-[12px]">
              <span>{(event.eventId ?? event.id).slice(0, 12)}</span>
              <span className="ml-auto text-muted-foreground">
                {formatAge(event.receivedAt)} ago
              </span>
            </span>
            <span className="w-full truncate font-mono text-[11px] text-muted-foreground">
              {[event.environment, event.release ? shortRelease(event.release) : null]
                .filter(Boolean)
                .join(' · ') || event.message}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
