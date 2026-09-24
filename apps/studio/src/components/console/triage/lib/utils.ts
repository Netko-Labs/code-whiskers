import type { QueryClient } from '@tanstack/react-query'
import { type TriageItemRef, type TriageRecord, triageQuery } from '@/integrations/studio-api'
import type { WhiskersEventDetail } from '@/integrations/whiskers'
import { formatAge } from '@/shared/format-date'
import { triageKey } from '../../shared/console-data'
import type {
  ConsoleItem,
  ConsoleTone,
  IssueTag,
  LogLevel,
  TriageFilter,
} from '../../shared/console-model'
import type { IssueEvidence, TriageBanner, TriageStatus } from './types'
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
  if (status.regressed) return 'Regressed'
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
  if (status.regressed)
    return {
      message: `Regressed — resolved ${status.decidedAt ? `${formatAge(status.decidedAt)} ago` : ''}, then seen again`,
      meta: 'resolve it again once the fix ships',
      tone: 'warn',
    }
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

const CRUMB_TONE: Record<string, ConsoleTone> = { error: 'bad', fatal: 'bad', warning: 'warn' }
const LOG_LEVEL: Record<string, LogLevel> = { ERROR: 'ERROR', FATAL: 'ERROR', WARN: 'WARN' }

function clock(value: Date | string | null): string {
  if (!value) return ''
  const date =
    typeof value === 'string'
      ? new Date(/^[0-9.]+$/.test(value) ? Number(value) * 1000 : value)
      : value
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString(undefined, { hour12: false })
}

/** The newest event, shaped for the stack, breadcrumb, log and tag panes. */
export function evidenceFromEvent(
  event: WhiskersEventDetail | undefined,
  baseTags: IssueTag[],
): Omit<IssueEvidence, 'isLoading'> {
  if (!event) return { frames: [], crumbs: [], logs: [], tags: baseTags, hiddenNote: undefined }
  const firstInApp = event.frames.findIndex((frame) => frame.isInApp)
  const libraryFrames = event.frames.filter((frame) => !frame.isInApp).length
  return {
    frames: event.frames.map((frame, index) => ({
      no: frame.line === null ? '' : String(frame.line),
      current: index === firstInApp,
      text: `${frame.function}  ${frame.file}${frame.line === null ? '' : `:${frame.line}`}`,
      tone: frame.isInApp ? ('strong' as const) : ('dim' as const),
    })),
    crumbs: event.breadcrumbs.map((crumb) => ({
      time: clock(crumb.timestamp),
      kind: crumb.category,
      tone: CRUMB_TONE[crumb.level] ?? 'muted',
      message: crumb.message,
    })),
    logs: event.logs.map((line) => ({
      time: clock(line.timestamp),
      level: LOG_LEVEL[line.level] ?? 'INFO',
      message: `${line.service}  ${line.message}`,
    })),
    tags: [
      ...baseTags,
      ...(event.release ? [{ key: 'release', value: event.release }] : []),
      ...(event.environment ? [{ key: 'environment', value: event.environment }] : []),
      ...(event.request?.url
        ? [{ key: 'request', value: `${event.request.method ?? ''} ${event.request.url}`.trim() }]
        : []),
      ...Object.entries(event.tags).map(([key, value]) => ({ key, value })),
    ],
    hiddenNote: libraryFrames
      ? `${libraryFrames} library frame${libraryFrames === 1 ? '' : 's'} dimmed`
      : undefined,
  }
}
