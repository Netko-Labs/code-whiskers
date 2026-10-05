import type { IssueBadge } from '@/integrations/whiskers'
import { DAY_MS, HOUR_MS, MINUTE_MS, WEEK_MS } from './constants'
import type { ArchiveGroup, IssueBadgeView, ResolveOption } from './types'

export const RESOLVE_OPTIONS: ResolveOption[] = [
  { mode: 'now', label: 'Resolve', shortcut: 'E' },
  { mode: 'next_release', label: 'Resolve in next release', shortcut: '⇧E' },
]

export const ARCHIVE_GROUPS: ArchiveGroup[] = [
  {
    label: 'Archive',
    options: [{ id: 'forever', label: 'Forever', choice: { kind: 'forever' } }],
  },
  {
    label: 'For',
    options: [
      { id: '30m', label: '30 minutes', choice: { kind: 'for', ms: 30 * MINUTE_MS } },
      { id: '2h', label: '2 hours', choice: { kind: 'for', ms: 2 * HOUR_MS } },
      { id: '6h', label: '6 hours', choice: { kind: 'for', ms: 6 * HOUR_MS } },
      { id: '1d', label: '1 day', choice: { kind: 'for', ms: DAY_MS } },
      { id: '1w', label: '1 week', choice: { kind: 'for', ms: WEEK_MS } },
    ],
  },
  {
    label: 'Until it happens again',
    options: [
      { id: 'e10', label: '10 more events', choice: { kind: 'events', count: 10 } },
      { id: 'e100', label: '100 more events', choice: { kind: 'events', count: 100 } },
      { id: 'e1000', label: '1,000 more events', choice: { kind: 'events', count: 1000 } },
    ],
  },
  {
    label: 'Until it reaches',
    options: [
      { id: 'u10', label: '10 more users', choice: { kind: 'users', count: 10 } },
      { id: 'u100', label: '100 more users', choice: { kind: 'users', count: 100 } },
    ],
  },
]

/** Most urgent first; the color sits in the dot, the label stays ink. */
export const BADGE_VIEWS: Record<IssueBadge, IssueBadgeView> = {
  regressed: { key: 'regressed', label: 'Regressed', tone: 'bad' },
  spiking: { key: 'spiking', label: 'Spiking', tone: 'warn' },
  new: { key: 'new', label: 'New', tone: 'info' },
}

export const STATUS_BADGES: Record<'resolved' | 'archived', IssueBadgeView> = {
  resolved: { key: 'resolved', label: 'Resolved', tone: 'ok' },
  archived: { key: 'archived', label: 'Archived', tone: 'neutral' },
}

export const LIFECYCLE_FAILED_NOTE = 'Could not save that — nothing changed'
export const LIFECYCLE_UNMIRRORED_NOTE = 'Saved — the issue list catches up on the next event'
export const ASSIGN_FAILED_NOTE = 'Could not change the assignee — nothing changed'
