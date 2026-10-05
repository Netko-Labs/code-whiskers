import { Button } from '@code-whiskers/ui/components/button'
import { ButtonGroup } from '@code-whiskers/ui/components/button-group'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { shortRelease } from '../../shared/issue-lifecycle'
import { clockOf, type IssueEventNavProps } from '../lib'
import { IssueEventPicker } from './issue-event-picker'

const DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

/** Which event is on screen, and the four ways to move: newest, oldest, older, newer. */
export function IssueEventNav({ issue, event, onPick }: IssueEventNavProps) {
  const facts = [
    event?.environment,
    event?.release ? shortRelease(event.release) : null,
    event?.request?.url ? `${event.request.method ?? ''} ${event.request.url}`.trim() : null,
  ].filter(Boolean)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-border px-3 py-2">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12px]">
        <span className="font-medium text-[13px]">Event</span>
        <span className="font-mono">{event?.eventId?.slice(0, 12) ?? '—'}</span>
        {event && (
          <span className="font-mono text-muted-foreground tabular-nums">
            {DATE.format(event.receivedAt)} {clockOf(event.receivedAt)}
          </span>
        )}
        {facts.map((fact, index) => (
          // Environment and release can carry the same name ("test").
          <span key={`${index}-${fact}`} className="truncate font-mono text-muted-foreground">
            · {fact}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <ButtonGroup>
          <Button variant="outline" size="xs" onClick={() => onPick('latest')}>
            Latest
          </Button>
          <Button variant="outline" size="xs" onClick={() => onPick('oldest')}>
            Oldest
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Older event"
            disabled={!event?.prevId}
            onClick={() => event?.prevId && onPick(event.prevId)}
          >
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Newer event"
            disabled={!event?.nextId}
            onClick={() => event?.nextId && onPick(event.nextId)}
          >
            <IconChevronRight />
          </Button>
        </ButtonGroup>
        <IssueEventPicker issue={issue} currentId={event?.id ?? null} onPick={onPick} />
      </div>
    </div>
  )
}
