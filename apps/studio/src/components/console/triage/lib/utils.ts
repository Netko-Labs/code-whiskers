import type { QueryClient } from '@tanstack/react-query'
import { type TriageItemRef, type TriageRecord, triageQuery } from '@/integrations/studio-api'
import { formatAge } from '@/shared/format-date'
import { triageKey } from '../../shared/console-data'
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
  return `${item.handle} ${item.title} ${item.subtitle}`.toLowerCase().includes(needle)
}

export function rowLabel(item: ConsoleItem, status: TriageStatus) {
  if (status.resolved) return 'Resolved'
  if (status.approved) return 'Approved'
  if (status.tracked) return 'Tracked'
  if (status.snoozedUntil) return 'Snoozed'
  return item.label
}

export function primaryLabel(item: ConsoleItem, status: TriageStatus) {
  if (item.kind === 'review') return status.approved ? 'Withdraw approval' : 'Approve'
  if (item.kind === 'log') return status.tracked ? 'Tracked' : 'Create issue'
  return status.resolved ? 'Reopen' : 'Resolve'
}

export function secondaryLabel(item: ConsoleItem, status: TriageStatus) {
  if (item.kind === 'review') return 'Open on GitHub'
  if (item.kind === 'log') return 'Mute 1h'
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
  if (status.resolved)
    return { message: 'Resolved — reopen it if it comes back', meta: decided, tone: 'ok' }
  if (status.approved)
    return {
      message: `Approved ${item.handle} in CodeWhiskers — the pull request on GitHub is unchanged`,
      meta: decided,
      tone: 'ok',
    }
  if (status.tracked) return { message: 'Tracked', meta: decided, tone: 'info' }
  if (status.snoozedUntil)
    return {
      message: `Snoozed until ${formatUntil(status.snoozedUntil)}`,
      meta: 'returns to the inbox on its own',
      tone: 'warn',
    }
  return null
}

export function readTriage(queryClient: QueryClient, ref: TriageItemRef): TriageRecord | undefined {
  const key = triageKey(ref)
  return queryClient.getQueryData(triageQuery().queryKey)?.find((r) => triageKey(r) === key)
}

/** Optimistic write into the cached decisions; returns what was there so a failure can undo it. */
export function patchTriageCache(
  queryClient: QueryClient,
  ref: TriageItemRef,
  patch: Partial<Pick<TriageRecord, 'status' | 'assigneeUserId' | 'snoozedUntil' | 'note'>>,
): TriageRecord | undefined {
  const key = triageKey(ref)
  const previous = readTriage(queryClient, ref)
  const base: TriageRecord = previous ?? {
    ...ref,
    status: 'open',
    assigneeUserId: null,
    snoozedUntil: null,
    note: null,
    updatedAt: new Date(),
  }
  const next: TriageRecord = { ...base, ...patch, updatedAt: new Date() }
  queryClient.setQueryData(triageQuery().queryKey, (records = []) => [
    ...records.filter((r) => triageKey(r) !== key),
    next,
  ])
  return previous
}

export function restoreTriageCache(
  queryClient: QueryClient,
  ref: TriageItemRef,
  previous: TriageRecord | undefined,
): void {
  const key = triageKey(ref)
  queryClient.setQueryData(triageQuery().queryKey, (records = []) => [
    ...records.filter((r) => triageKey(r) !== key),
    ...(previous ? [previous] : []),
  ])
}
