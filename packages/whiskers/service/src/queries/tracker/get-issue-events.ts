import { eventTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, desc, eq, sql } from 'drizzle-orm'
import type { IssueEventPage } from './types'
import { decodeCursor, encodeCursor, isUuid } from './utils'

/** One issue's events, newest first, keyset-paged on `(received_at, id)`. `null`: bad cursor. */
export const getIssueEvents = async (
  issueId: string,
  options: { cursor?: string; limit: number },
): Promise<IssueEventPage | null> => {
  if (!isUuid(issueId)) return { events: [], nextCursor: null }
  const cursor = options.cursor ? decodeCursor(options.cursor) : undefined
  if (cursor === null) return null
  if (cursor && (typeof cursor.value !== 'string' || Number.isNaN(Date.parse(cursor.value)))) {
    return null
  }

  const rows = await db
    .select({
      id: eventTable.id,
      eventId: eventTable.eventId,
      receivedAt: eventTable.receivedAt,
      level: eventTable.level,
      message: eventTable.message,
      environment: eventTable.environment,
      release: eventTable.release,
    })
    .from(eventTable)
    .where(
      and(
        eq(eventTable.issueId, issueId),
        cursor &&
          sql`(${eventTable.receivedAt}, ${eventTable.id}) < (${cursor.value}::timestamp, ${cursor.id}::uuid)`,
      ),
    )
    .orderBy(desc(eventTable.receivedAt), desc(eventTable.id))
    .limit(options.limit + 1)

  const events = rows.slice(0, options.limit)
  const last = events.at(-1)
  return {
    events,
    nextCursor:
      rows.length > options.limit && last
        ? encodeCursor(last.receivedAt.toISOString(), last.id)
        : null,
  }
}
