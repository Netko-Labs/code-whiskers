import { eventTable, logLineTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, asc, desc, eq, type SQL, sql } from 'drizzle-orm'
import { TRACE_LOG_LIMIT } from './constants'
import { normalizeEvent } from './normalize-event'
import type { IssueEventDetail } from './types'
import { isUuid } from './utils'

const DETAIL_COLUMNS = {
  id: eventTable.id,
  eventId: eventTable.eventId,
  payload: eventTable.payload,
  receivedAt: eventTable.receivedAt,
}

async function pickEvent(issueId: string, which: string) {
  const byIssue = eq(eventTable.issueId, issueId)
  const query = db.select(DETAIL_COLUMNS).from(eventTable)
  if (which === 'latest' || which === 'oldest') {
    const order = which === 'latest' ? desc : asc
    return (
      await query
        .where(byIssue)
        .orderBy(order(eventTable.receivedAt), order(eventTable.id))
        .limit(1)
    )[0]
  }
  if (!isUuid(which)) return undefined
  return (await query.where(and(byIssue, eq(eventTable.id, which))).limit(1))[0]
}

async function neighbourId(issueId: string, position: SQL, isNewer: boolean) {
  const order = isNewer ? asc : desc
  const [row] = await db
    .select({ id: eventTable.id })
    .from(eventTable)
    .where(and(eq(eventTable.issueId, issueId), position))
    .orderBy(order(eventTable.receivedAt), order(eventTable.id))
    .limit(1)
  return row?.id ?? null
}

/**
 * One event of an issue, read for a human: frames, breadcrumbs, tags, its neighbours for paging —
 * and when the SDK propagated a trace, the log lines that share it. `which` is a row id, `latest`
 * or `oldest`.
 */
export const getIssueEvent = async (
  issueId: string,
  which: string,
): Promise<IssueEventDetail | null> => {
  if (!isUuid(issueId)) return null
  const row = await pickEvent(issueId, which)
  if (!row) return null

  const at = sql`(${row.receivedAt.toISOString()}::timestamp, ${row.id}::uuid)`
  const detail = normalizeEvent(row.payload)
  const [prevId, nextId, logs] = await Promise.all([
    neighbourId(issueId, sql`(${eventTable.receivedAt}, ${eventTable.id}) < ${at}`, false),
    neighbourId(issueId, sql`(${eventTable.receivedAt}, ${eventTable.id}) > ${at}`, true),
    detail.traceId
      ? db
          .select({
            timestamp: logLineTable.timestamp,
            level: logLineTable.level,
            service: logLineTable.service,
            message: logLineTable.message,
          })
          .from(logLineTable)
          .where(eq(logLineTable.traceId, detail.traceId))
          .orderBy(asc(logLineTable.timestamp))
          .limit(TRACE_LOG_LIMIT)
      : [],
  ])
  return {
    ...detail,
    id: row.id,
    eventId: row.eventId,
    receivedAt: row.receivedAt,
    logs,
    prevId,
    nextId,
  }
}

/** The newest event; kept for `/v1/issues/:id/latest-event`. */
export const getLatestEvent = (issueId: string) => getIssueEvent(issueId, 'latest')
