import { formatAge } from '@/shared/format-date'
import type { ConsoleItem, TriageFilter } from '../../shared/console-model'
import type {
  LeavingRow,
  RecencyGroup,
  SelectionAnchor,
  TriageBanner,
  TriageGroup,
  TriageRowEntry,
  TriageStatus,
} from './types'
import { RECENCY_LABELS, RECENCY_ORDER, SNOOZE_MS } from './values'

const DAY_MS = 24 * 60 * 60 * 1000

const FILTER_KIND: Record<Exclude<TriageFilter, 'all'>, ConsoleItem['kind']> = {
  errors: 'error',
  reviews: 'review',
  logs: 'log',
  alerts: 'alert',
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

export function primaryLabel(status: TriageStatus) {
  return status.archived ? 'Move to inbox' : 'Done'
}

export function secondaryLabel(status: TriageStatus) {
  return status.snoozedUntil ? 'Unsnooze' : 'Snooze 1 day'
}

export function formatUntil(date: Date): string {
  return date.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

export function snoozeDeadline(now = new Date()): Date {
  return new Date(now.getTime() + SNOOZE_MS)
}

export function bannerFor(item: ConsoleItem, status: TriageStatus): TriageBanner | null {
  const decided = status.decidedAt ? `saved ${formatAge(status.decidedAt)} ago` : ''
  if (status.archived) {
    return {
      message: 'Done — back in the inbox if it moves again',
      meta: decided,
      tone: 'resolved',
    }
  }
  if (status.approved) {
    return { message: `Approved ${item.handle} in CodeWhiskers`, meta: decided, tone: 'resolved' }
  }
  if (status.tracked) return { message: 'Tracked', meta: decided, tone: 'info' }
  if (status.snoozedUntil) {
    return {
      message: `Snoozed until ${formatUntil(status.snoozedUntil)}`,
      meta: 'returns on its own',
      tone: 'warning',
    }
  }
  return null
}

export function recencyOf(at: Date | undefined, now: Date): RecencyGroup {
  if (!at) return 'earlier'
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (at.getTime() >= startOfToday) return 'today'
  return at.getTime() >= startOfToday - 6 * DAY_MS ? 'week' : 'earlier'
}

/** Linear's inbox bands. Order inside a band is the list's own; empty bands are dropped. */
export function groupByRecency(rows: TriageRowEntry[], now = new Date()): TriageGroup[] {
  const groups = new Map<RecencyGroup, TriageRowEntry[]>()
  for (const row of rows) {
    const key = recencyOf(row.item.at, now)
    groups.set(key, [...(groups.get(key) ?? []), row])
  }
  return RECENCY_ORDER.flatMap((key) => {
    const grouped = groups.get(key)
    return grouped ? [{ key, label: RECENCY_LABELS[key], rows: grouped }] : []
  })
}

export function goneRows(before: ConsoleItem[], after: ConsoleItem[]): LeavingRow[] {
  const present = new Set(after.map((item) => item.id))
  return before.flatMap((item, index) => (present.has(item.id) ? [] : [{ item, index }]))
}

/** Rows that just left go back where they were, flagged, so they can fold away in place. */
export function mergeLeaving(items: ConsoleItem[], leaving: LeavingRow[]): TriageRowEntry[] {
  const rows: TriageRowEntry[] = items.map((item) => ({ item, isLeaving: false }))
  const present = new Set(items.map((item) => item.id))
  const gone = leaving.filter((row) => !present.has(row.item.id)).sort((a, b) => a.index - b.index)
  for (const row of gone) {
    rows.splice(Math.min(row.index, rows.length), 0, { item: row.item, isLeaving: true })
  }
  return rows
}

/**
 * The selection survives its row leaving: whatever took its place is selected, using where the
 * requested row was last seen. Without a request (or an anchor for it) the first row is.
 */
export function nextSelection(
  items: ConsoleItem[],
  selectedId: string | undefined,
  anchor: SelectionAnchor | null,
): ConsoleItem | undefined {
  const current = items.find((item) => item.id === selectedId)
  if (current) return current
  if (!selectedId || anchor?.id !== selectedId) return items[0]
  return items[Math.min(anchor.index, items.length - 1)]
}
