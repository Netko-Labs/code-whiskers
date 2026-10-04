import {
  type Event,
  eventTable,
  issueTable,
  type SentryEvent,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { sql, TransactionRollbackError } from 'drizzle-orm'
import { announce } from '../../realtime'
import { fingerprintOf, levelOf, messageOf } from '../../tracker'

/** Idempotent per (project, event_id): a retried event is dropped and the issue count rolls back. */
export const ingestEvent = async (
  projectId: string,
  event: SentryEvent,
): Promise<Event | undefined> => {
  const fingerprint = fingerprintOf(event)
  const level = levelOf(event)
  const message = messageOf(event)

  try {
    const stored = await db.transaction(async (tx) => {
      const issue = await tx
        .insert(issueTable)
        .values({ projectId, fingerprint, title: message, level, eventCount: 1 })
        .onConflictDoUpdate({
          target: [issueTable.projectId, issueTable.fingerprint],
          set: {
            eventCount: sql`${issueTable.eventCount} + 1`,
            lastSeen: new Date(),
            level,
          },
        })
        .returning()
        .then(([r]) => r)
      if (!issue) return undefined

      const stored = await tx
        .insert(eventTable)
        .values({
          eventId: event.event_id,
          projectId,
          issueId: issue.id,
          level,
          message,
          environment: event.environment,
          release: event.release,
          payload: event,
        })
        .onConflictDoNothing({ target: [eventTable.projectId, eventTable.eventId] })
        .returning()
        .then(([r]) => r)
      if (!stored) tx.rollback()
      return stored
    })
    if (stored) announce('issues')
    return stored
  } catch (error) {
    if (error instanceof TransactionRollbackError) return undefined
    throw error
  }
}
