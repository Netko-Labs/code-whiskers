import { eventTable, logLineTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { asc, desc, eq } from 'drizzle-orm'
import { normalizeEvent } from './normalize-event'
import type { EventDetail } from './types'

const TRACE_LOG_LIMIT = 50

/**
 * The newest event of an issue, read for a human: frames, breadcrumbs, tags — and when the SDK
 * propagated a trace, the log lines that share it.
 */
export const getLatestEvent = async (issueId: string): Promise<EventDetail | null> => {
  const [row] = await db
    .select({ payload: eventTable.payload, receivedAt: eventTable.receivedAt })
    .from(eventTable)
    .where(eq(eventTable.issueId, issueId))
    .orderBy(desc(eventTable.receivedAt))
    .limit(1)
  if (!row) return null

  const detail = normalizeEvent(row.payload)
  const logs = detail.traceId
    ? await db
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
    : []
  return { ...detail, receivedAt: row.receivedAt, logs }
}
