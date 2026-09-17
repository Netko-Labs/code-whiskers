import type { ConsoleItem, TriageFilter } from '../../shared/console-model'
import type { TriageBanner, TriageStatus } from './types'

const FILTER_KIND: Record<Exclude<TriageFilter, 'all'>, ConsoleItem['kind']> = {
  errors: 'error',
  reviews: 'review',
  logs: 'log',
}

export function matchesFilter(item: ConsoleItem, filter: TriageFilter) {
  return filter === 'all' || item.kind === FILTER_KIND[filter]
}

export function rowLabel(item: ConsoleItem, status: TriageStatus) {
  if (status.resolved) return 'Resolved'
  if (status.approved) return 'Approved'
  if (status.tracked) return 'Tracked'
  return item.label
}

export function primaryLabel(item: ConsoleItem, status: TriageStatus) {
  if (item.kind === 'review') return status.approved ? 'Approved' : 'Approve'
  if (item.kind === 'log') return status.tracked ? 'Tracked' : 'Create issue'
  return status.resolved ? 'Reopen' : 'Resolve'
}

export function secondaryLabel(item: ConsoleItem) {
  if (item.kind === 'review') return 'Request changes'
  if (item.kind === 'log') return 'Mute 1h'
  return 'Snooze'
}

export function bannerFor(item: ConsoleItem, status: TriageStatus): TriageBanner | null {
  if (status.resolved)
    return {
      message: 'Resolved by you — Whiskers will reopen this if it fires again',
      meta: 'watching for 24h',
      tone: 'ok',
    }
  if (status.approved)
    return {
      message: `You approved ${item.id} — the blocker is cleared`,
      meta: 'merges on green checks',
      tone: 'ok',
    }
  if (status.tracked)
    return {
      message: 'Tracked as CW-2048 — alert condition saved',
      meta: 'notifies #oncall-platform',
      tone: 'info',
    }
  if (status.dismissed)
    return {
      message: 'Blocker dismissed — Whiskers noted your reasoning',
      meta: 'will not re-flag on this branch',
      tone: 'warn',
    }
  return null
}
