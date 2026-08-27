import {
  type Event,
  eventTable,
  issueTable,
  type SentryEvent,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'
import { fingerprintOf, levelOf, messageOf } from '../../tracker'

export const ingestEvent = async (
  projectId: string,
  event: SentryEvent,
): Promise<Event | undefined> => {
  const fingerprint = fingerprintOf(event)
  const level = levelOf(event)
  const message = messageOf(event)

  const issue = await db
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

  return await db
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
    .returning()
    .then(([r]) => r)
}
