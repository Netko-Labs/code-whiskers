import { formatAge } from '@/shared/format-date'
import type { ConsoleItem, TriageFilter } from '../../shared/console-model'
import type { TriageBanner, TriageStatus } from './types'
import { SNOOZE_MS } from './values'

const FILTER_KIND: Record<Exclude<TriageFilter, 'all'>, ConsoleItem['kind']> = {
  errors: 'error',
  reviews: 'review',
  logs: 'log',
}

export function matchesFilter(item: ConsoleItem, filter: TriageFilter) {
  return filter === 'all' || item.kind === FILTER_KIND[filter]
}

export function matchesQuery(item: ConsoleItem, query: string): boolean {
  const needle = query.trim().toLowerCase()
  return `${item.handle} ${item.title} ${item.subtitle} ${item.repository ?? ''} ${item.scopeLabel}`
    .toLowerCase()
    .includes(needle)
}

/** Reviews and log patterns only; issues carry their own lifecycle actions. */
export function primaryLabel(item: ConsoleItem, status: TriageStatus) {
  if (item.kind === 'review') return status.approved ? 'Withdraw approval' : 'Approve'
  return status.tracked ? 'Untrack' : 'Track'
}

export function secondaryLabel(item: ConsoleItem, status: TriageStatus) {
  if (item.kind === 'review') return 'Open on GitHub'
  return status.snoozedUntil ? 'Unsnooze' : 'Snooze 1 day'
}

export function formatUntil(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function snoozeDeadline(now = new Date()): Date {
  return new Date(now.getTime() + SNOOZE_MS)
}

export function bannerFor(item: ConsoleItem, status: TriageStatus): TriageBanner | null {
  const decided = status.decidedAt ? `saved ${formatAge(status.decidedAt)} ago` : ''
  if (status.approved)
    return {
      message: `Approved ${item.handle} in CodeWhiskers — the pull request on GitHub is unchanged`,
      meta: decided,
      tone: 'ok',
    }
  if (status.tracked)
    return { message: 'Tracked — the team is on this pattern', meta: decided, tone: 'info' }
  if (status.snoozedUntil)
    return {
      message: `Snoozed until ${formatUntil(status.snoozedUntil)}`,
      meta: 'returns to the inbox on its own',
      tone: 'warn',
    }
  return null
}

function statusWord(status: TriageStatus): string | null {
  if (status.regressed) return 'Regressed'
  if (status.resolved) return 'Resolved'
  if (status.archived) return 'Archived'
  if (status.approved) return 'Approved'
  if (status.tracked) return 'Tracked'
  if (status.snoozedUntil) return 'Snoozed'
  return null
}

/** One quiet line under the title: where it lives, what it is, and the one fact worth knowing. */
export function rowMeta(
  item: ConsoleItem,
  status: TriageStatus,
  owner: string | undefined,
): string {
  const what =
    item.kind === 'review' ? item.handle : item.kind === 'log' ? 'log pattern' : item.label
  const fact = owner ? `→ ${owner}` : item.meta
  return [statusWord(status), item.scopeLabel, what, fact].filter(Boolean).join(' · ')
}

/** The item's state in words, for the header: badges read as sentence case, not shouted. */
export function stateLine(item: ConsoleItem): string {
  const text = (item.badge2 || item.badge).toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}
