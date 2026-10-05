import { cn } from '@code-whiskers/ui/lib/utils'
import { IconPaw } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { SeverityDot } from '@/components/shared/status'
import { formatAge } from '@/shared/format-date'
import { PersonAvatar } from '../../shared/console-ui'
import type { FeedEntryProps } from '../lib'

const SUBJECT = 'block truncate text-muted-foreground transition-colors hover:text-foreground'

function Subject({ entry }: Pick<FeedEntryProps, 'entry'>) {
  const { link, subject } = entry
  if (link?.kind === 'issue') {
    return (
      <Link to="/console/issues/$issueId" params={{ issueId: link.issueId }} className={SUBJECT}>
        {subject}
      </Link>
    )
  }
  if (link?.kind === 'inbox') {
    return (
      <Link
        to="/console/triage/$bucket"
        params={{ bucket: 'inbox' }}
        search={{ sel: link.itemId }}
        className={SUBJECT}
      >
        {subject}
      </Link>
    )
  }
  if (link?.kind === 'external') {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={SUBJECT}>
        {subject}
      </a>
    )
  }
  return <span className="block truncate text-muted-foreground">{subject}</span>
}

/** Who did what to which item; whiskers' own entries carry a paw instead of a face. */
export function FeedEntry({ entry, isFresh }: FeedEntryProps) {
  return (
    <li className={cn('flex gap-3 rounded-md px-2 py-2', isFresh && 'animate-highlight')}>
      {entry.actor.isWhiskers ? (
        <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <IconPaw className="size-3.5" stroke={1.75} />
        </span>
      ) : (
        <PersonAvatar name={entry.actor.name} image={entry.actor.image} />
      )}
      <div className="flex min-w-0 flex-1 flex-col text-ui">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate">
            <span className="font-medium text-foreground">{entry.actor.name}</span>{' '}
            <span className="text-muted-foreground">{entry.verb}</span>
          </span>
          {entry.tone !== 'neutral' && <SeverityDot tone={entry.tone} size="sm" />}
          <span className="ml-auto shrink-0 font-mono text-2xs text-faint tabular-nums">
            {formatAge(entry.at)}
          </span>
        </span>
        <Subject entry={entry} />
      </div>
    </li>
  )
}
