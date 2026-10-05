import { issueTable, type Release, releaseTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, asc, count, desc, eq, gt, isNotNull, lt, or, type SQL, sql } from 'drizzle-orm'
import { resolvedWindowOf } from '../../releases'
import { FIRST_RELEASE, ISSUE_ROW_COLUMNS, toIssueRows } from '../tracker/issue-row'
import type { IssueRow } from '../tracker/types'
import { RELEASE_ISSUE_LIMIT } from './constants'
import type { Neighbours } from './types'

/** The release whose event the issue reopened on: the newest at or before the regression. */
const REGRESSED_RELEASE = sql<string | null>`(
  select e.release from event e
  where e.issue_id = "issue"."id" and e.received_at <= "issue"."regressed_at"
  order by e.received_at desc limit 1
)`

async function issueRows(where: SQL | undefined, now: Date): Promise<IssueRow[]> {
  const rows = await db
    .select(ISSUE_ROW_COLUMNS)
    .from(issueTable)
    .where(where)
    .orderBy(desc(issueTable.eventCount), desc(issueTable.id))
    .limit(RELEASE_ISSUE_LIMIT)
  return toIssueRows(rows, now)
}

const isNewIn = (release: Release) =>
  and(eq(issueTable.projectId, release.projectId), sql`${FIRST_RELEASE} = ${release.version}`)

export async function newIssueTotalOf(release: Release): Promise<number> {
  const [row] = await db.select({ value: count() }).from(issueTable).where(isNewIn(release))
  return row?.value ?? 0
}

export async function neighboursOf(release: Release): Promise<Neighbours> {
  const columns = { version: releaseTable.version, firstSeen: releaseTable.firstSeen }
  const sameProject = eq(releaseTable.projectId, release.projectId)
  const [[previous], [next]] = await Promise.all([
    db
      .select(columns)
      .from(releaseTable)
      .where(and(sameProject, lt(releaseTable.firstSeen, release.firstSeen)))
      .orderBy(desc(releaseTable.firstSeen))
      .limit(1),
    db
      .select(columns)
      .from(releaseTable)
      .where(and(sameProject, gt(releaseTable.firstSeen, release.firstSeen)))
      .orderBy(asc(releaseTable.firstSeen))
      .limit(1),
  ])
  return { previous: previous ?? null, next: next ?? null }
}

function resolvedHere(release: Release, neighbours: Neighbours): SQL | undefined {
  const window = resolvedWindowOf(
    neighbours.previous?.firstSeen ?? null,
    release.firstSeen,
    neighbours.next?.firstSeen ?? null,
  )
  const at = (date: Date) => sql`${date.toISOString()}::timestamp`
  const inNext = and(
    isNotNull(issueTable.resolvedInRelease),
    window.nextFrom ? sql`${issueTable.resolvedAt} >= ${at(window.nextFrom)}` : undefined,
    sql`${issueTable.resolvedAt} < ${at(window.nextUntil)}`,
  )
  const inNow = and(
    sql`${issueTable.resolvedInRelease} is null`,
    sql`${issueTable.resolvedAt} >= ${at(window.nowFrom)}`,
    window.nowUntil ? sql`${issueTable.resolvedAt} < ${at(window.nowUntil)}` : undefined,
  )
  return and(
    eq(issueTable.projectId, release.projectId),
    eq(issueTable.status, 'resolved'),
    or(inNext, inNow),
  )
}

/** New in this release, reopened by it, and resolved by it — the three lists of its overview. */
export async function releaseIssuesOf(release: Release, neighbours: Neighbours, now: Date) {
  const [newIssues, regressedIssues, resolvedIssues] = await Promise.all([
    issueRows(isNewIn(release), now),
    issueRows(
      and(
        eq(issueTable.projectId, release.projectId),
        isNotNull(issueTable.regressedAt),
        sql`${REGRESSED_RELEASE} = ${release.version}`,
      ),
      now,
    ),
    issueRows(resolvedHere(release, neighbours), now),
  ])
  return { newIssues, regressedIssues, resolvedIssues }
}
