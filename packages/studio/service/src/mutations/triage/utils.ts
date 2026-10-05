import type { IssueArchive } from '@code-whiskers/studio-domain'
import type { IssueDecision, LifecycleDecision, MirrorRow } from './types'

const STATUS_OF = { unresolved: 'open', resolved: 'resolved', archived: 'archived' } as const

/** A lifecycle request as the `triage_state` columns that remember it. */
export function issueDecisionOf(lifecycle: LifecycleDecision): IssueDecision {
  const archive =
    lifecycle.status === 'archived' ? (lifecycle.archive ?? { mode: 'forever' }) : null
  return {
    status: STATUS_OF[lifecycle.status],
    resolveMode: lifecycle.status === 'resolved' ? (lifecycle.resolve?.mode ?? 'now') : null,
    archiveMode: archive?.mode ?? null,
    archiveValue:
      archive?.mode === 'until'
        ? archive.until.toISOString()
        : archive?.mode === 'events' || archive?.mode === 'users'
          ? String(archive.count)
          : null,
  }
}

function archiveOf(mode: string | null, value: string | null): IssueArchive {
  if (mode === 'until' && value && !Number.isNaN(Date.parse(value))) {
    return { mode: 'until', until: new Date(value) }
  }
  const count = Number(value)
  if ((mode === 'events' || mode === 'users') && Number.isInteger(count) && count > 0) {
    return { mode, count }
  }
  return { mode: 'forever' }
}

/**
 * The remembered decision as whiskers takes it — the inverse of `issueDecisionOf`. A pre-archive
 * snooze still counts; statuses issues never use have nothing to mirror.
 */
export function lifecycleOf(row: MirrorRow): LifecycleDecision | null {
  switch (row.status) {
    case 'open':
      return { status: 'unresolved' }
    case 'resolved':
      return {
        status: 'resolved',
        resolve: { mode: row.resolveMode === 'next_release' ? 'next_release' : 'now' },
      }
    case 'archived':
      return { status: 'archived', archive: archiveOf(row.archiveMode, row.archiveValue) }
    case 'snoozed':
      return {
        status: 'archived',
        archive: row.snoozedUntil
          ? { mode: 'until', until: row.snoozedUntil }
          : { mode: 'forever' },
      }
    default:
      return null
  }
}

export function chunks<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  )
}
