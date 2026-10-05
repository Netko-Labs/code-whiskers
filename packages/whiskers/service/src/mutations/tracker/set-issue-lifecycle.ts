import { type IssueLifecycleBody, issueTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { REOPENED } from './constants'
import type { IssueLifecycle, IssuePatch } from './types'

const NOT_RESOLVED = { resolvedInRelease: null, resolvedAt: null } as const
const NOT_ARCHIVED = { archivedUntil: null, archiveUntilEvents: null, archiveUntilUsers: null }

/** Targets are computed from the row's own counts, so one statement serves a whole selection. */
function patchOf(body: IssueLifecycleBody, now: Date): IssuePatch {
  if (body.status === 'unresolved') return REOPENED
  if (body.status === 'resolved') {
    const isNextRelease = body.resolve?.mode === 'next_release'
    return {
      ...NOT_ARCHIVED,
      status: 'resolved',
      resolvedAt: now,
      // No release seen yet means there is no "next" one to wait for: it resolves now.
      resolvedInRelease: isNextRelease ? sql`${issueTable.lastRelease}` : null,
      regressedAt: null,
    }
  }
  const archive = body.archive ?? { mode: 'forever' }
  return {
    ...NOT_RESOLVED,
    ...NOT_ARCHIVED,
    status: 'archived',
    regressedAt: null,
    ...(archive.mode === 'until' && { archivedUntil: archive.until }),
    ...(archive.mode === 'events' && {
      archiveUntilEvents: sql`${issueTable.eventCount} + ${archive.count}`,
    }),
    ...(archive.mode === 'users' && {
      archiveUntilUsers: sql`${issueTable.userCount} + ${archive.count}`,
    }),
  }
}

/** Only the authorized project's issues change, and only those come back. */
export const lifecycleUpdateOf = (body: IssueLifecycleBody, now: Date) =>
  db
    .update(issueTable)
    .set(patchOf(body, now))
    .where(and(eq(issueTable.projectId, body.projectId), inArray(issueTable.id, body.issueIds)))

export const setIssueLifecycle = async (body: IssueLifecycleBody): Promise<IssueLifecycle[]> => {
  return await lifecycleUpdateOf(body, new Date()).returning({
    id: issueTable.id,
    projectId: issueTable.projectId,
    status: issueTable.status,
    resolvedInRelease: issueTable.resolvedInRelease,
    resolvedAt: issueTable.resolvedAt,
    archivedUntil: issueTable.archivedUntil,
    archiveUntilEvents: issueTable.archiveUntilEvents,
    archiveUntilUsers: issueTable.archiveUntilUsers,
    regressedAt: issueTable.regressedAt,
    eventCount: issueTable.eventCount,
    userCount: issueTable.userCount,
    lastRelease: issueTable.lastRelease,
  })
}
