import {
  type Event,
  eventTable,
  issueTable,
  type SentryEvent,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, eq, min, ne, sql, TransactionRollbackError } from 'drizzle-orm'
import { announce } from '../../realtime'
import { postToStudio } from '../../review/studio-client'
import {
  eventCulpritOf,
  fingerprintOf,
  ingestTransitionOf,
  levelOf,
  messageOf,
  needsReleaseAge,
  userKeyOf,
} from '../../tracker'
import { REOPENED } from './constants'
import type { IngestOutcome, Transaction } from './types'

async function isNewUser(tx: Transaction, stored: Event): Promise<boolean> {
  if (!stored.userKey) return false
  const [seen] = await tx
    .select({ id: eventTable.id })
    .from(eventTable)
    .where(
      and(
        eq(eventTable.issueId, stored.issueId),
        eq(eventTable.userKey, stored.userKey),
        ne(eventTable.id, stored.id),
      ),
    )
    .limit(1)
  return !seen
}

async function releaseFirstSeenAt(tx: Transaction, projectId: string, release: string) {
  const [row] = await tx
    .select({ at: min(eventTable.receivedAt) })
    .from(eventTable)
    .where(and(eq(eventTable.projectId, projectId), eq(eventTable.release, release)))
  return row?.at ?? null
}

/**
 * Idempotent per (project, event_id): a retried event is dropped and the issue count rolls back.
 * The issue upsert holds the row lock until commit, so lifecycle checks see one event at a time.
 */
export const ingestEvent = async (
  projectId: string,
  event: SentryEvent,
): Promise<Event | undefined> => {
  const fingerprint = fingerprintOf(event)
  const level = levelOf(event)
  const message = messageOf(event)
  const release = event.release ?? null
  const culprit = eventCulpritOf(event)

  try {
    const outcome = await db.transaction(async (tx): Promise<IngestOutcome | undefined> => {
      const issue = await tx
        .insert(issueTable)
        .values({
          projectId,
          fingerprint,
          title: message,
          level,
          eventCount: 1,
          lastRelease: release,
          culprit,
        })
        .onConflictDoUpdate({
          target: [issueTable.projectId, issueTable.fingerprint],
          set: {
            eventCount: sql`${issueTable.eventCount} + 1`,
            lastSeen: new Date(),
            level,
            lastRelease: sql`coalesce(excluded.last_release, ${issueTable.lastRelease})`,
            culprit: sql`coalesce(excluded.culprit, ${issueTable.culprit})`,
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
          release,
          userKey: userKeyOf(event),
          payload: event,
        })
        .onConflictDoNothing({ target: [eventTable.projectId, eventTable.eventId] })
        .returning()
        .then(([r]) => r)
      if (!stored) return tx.rollback()

      const isNew = await isNewUser(tx, stored)
      const userCount = issue.userCount + (isNew ? 1 : 0)
      const transition = ingestTransitionOf(
        { ...issue, userCount },
        {
          release,
          releaseFirstSeenAt:
            release && needsReleaseAge(issue, release)
              ? await releaseFirstSeenAt(tx, projectId, release)
              : null,
          now: new Date(),
        },
      )
      if (isNew || transition) {
        await tx
          .update(issueTable)
          .set({
            ...(isNew && { userCount: sql`${issueTable.userCount} + 1` }),
            ...(transition && REOPENED),
            ...(transition === 'regressed' && { regressedAt: new Date() }),
          })
          .where(eq(issueTable.id, issue.id))
      }
      return { stored, transition }
    })
    if (!outcome) return undefined

    announce('issues')
    const { stored, transition } = outcome
    if (transition) {
      void postToStudio('issues/transition', {
        issueId: stored.issueId,
        projectId,
        kind: transition,
        eventId: stored.id,
        release,
      })
    }
    return stored
  } catch (error) {
    if (error instanceof TransactionRollbackError) return undefined
    throw error
  }
}
