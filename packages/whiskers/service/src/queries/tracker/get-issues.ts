import { type IssueListQuery, issueTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, count, desc, eq, ilike, inArray, type SQL, sql } from 'drizzle-orm'
import { ISSUE_ROW_COLUMNS, toIssueRows } from './issue-row'
import type { Cursor, IssueFilter, IssuePage } from './types'
import { decodeCursor, encodeCursor } from './utils'

const SORTS = {
  last_seen: { column: issueTable.lastSeen, field: 'lastSeen' },
  first_seen: { column: issueTable.firstSeen, field: 'firstSeen' },
  events: { column: issueTable.eventCount, field: 'eventCount' },
  users: { column: issueTable.userCount, field: 'userCount' },
} as const

const isDateSort = (sort: IssueListQuery['sort']) => sort === 'last_seen' || sort === 'first_seen'

function likePattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

function hasEventWhere(column: 'environment' | 'release', value: string): SQL {
  return sql`exists (
    select 1 from event e where e.issue_id = "issue"."id" and ${sql.raw(`e.${column}`)} = ${value}
  )`
}

function filtersOf(filter: IssueFilter): SQL[] {
  const { query } = filter
  return [
    filter.projectIds && inArray(issueTable.projectId, filter.projectIds),
    filter.ids && inArray(issueTable.id, filter.ids),
    query.status !== 'all' && eq(issueTable.status, query.status),
    query.environment && hasEventWhere('environment', query.environment),
    query.release && hasEventWhere('release', query.release),
    query.q?.trim() && ilike(issueTable.title, likePattern(query.q.trim())),
  ].filter((condition): condition is SQL => Boolean(condition))
}

/** Keyset on `(sort, id)`, both descending; a cursor of the wrong shape for the sort is refused. */
function afterCursor(sort: IssueListQuery['sort'], cursor: Cursor): SQL | null {
  const { column } = SORTS[sort]
  if (isDateSort(sort)) {
    if (typeof cursor.value !== 'string' || Number.isNaN(Date.parse(cursor.value))) return null
    return sql`(${column}, ${issueTable.id}) < (${cursor.value}::timestamp, ${cursor.id}::uuid)`
  }
  if (typeof cursor.value !== 'number') return null
  return sql`(${column}, ${issueTable.id}) < (${cursor.value}, ${cursor.id}::uuid)`
}

/** One page of issues, newest churn first by default. `null` means the cursor was not ours. */
export const getIssues = async (filter: IssueFilter): Promise<IssuePage | null> => {
  const { query } = filter
  if (filter.ids?.length === 0) return { issues: [], nextCursor: null, total: 0 }
  const decoded = query.cursor ? decodeCursor(query.cursor) : undefined
  if (decoded === null) return null
  const after = decoded ? afterCursor(query.sort, decoded) : undefined
  if (after === null) return null

  const filters = filtersOf(filter)
  const { column, field } = SORTS[query.sort]
  const [rows, [total]] = await Promise.all([
    db
      .select(ISSUE_ROW_COLUMNS)
      .from(issueTable)
      .where(and(...filters, after))
      .orderBy(desc(column), desc(issueTable.id))
      .limit(query.limit + 1),
    db
      .select({ value: count() })
      .from(issueTable)
      .where(and(...filters)),
  ])

  const page = rows.slice(0, query.limit)
  const last = page.at(-1)?.issue
  const lastValue = last?.[field]
  return {
    issues: await toIssueRows(page, new Date()),
    nextCursor:
      rows.length > query.limit && last && lastValue !== undefined
        ? encodeCursor(lastValue instanceof Date ? lastValue.toISOString() : lastValue, last.id)
        : null,
    total: total?.value ?? 0,
  }
}
