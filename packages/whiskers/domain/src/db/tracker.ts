import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { ISSUE_STATUSES } from '../values'

/**
 * Sentry DSN shape is `http://<publicKey>@host/<projectId>` — the id is the
 * DSN path segment and the key is what SDKs send as `sentry_key`.
 */
export const projectTable = pgTable('project', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  repository: text('repository'),
  publicKey: text('public_key').notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
})

export const issueTable = pgTable(
  'issue',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    fingerprint: text('fingerprint').notNull(),
    title: text('title').notNull(),
    level: text('level').notNull().default('error'),
    /** A mirror of studio's decision, so ingest can reopen and lists can filter without a call. */
    status: text('status', { enum: ISSUE_STATUSES }).notNull().default('unresolved'),
    /** Resolved in next release: the release after this one regresses it; null resolves now. */
    resolvedInRelease: text('resolved_in_release'),
    resolvedAt: timestamp('resolved_at'),
    archivedUntil: timestamp('archived_until'),
    /** Target totals, not deltas: ingest compares them to `event_count` / `user_count`. */
    archiveUntilEvents: integer('archive_until_events'),
    archiveUntilUsers: integer('archive_until_users'),
    regressedAt: timestamp('regressed_at'),
    eventCount: integer('event_count').notNull().default(0),
    userCount: integer('user_count').notNull().default(0),
    lastRelease: text('last_release'),
    /** Top in-app frame of the newest event that had one: `module:function`. */
    culprit: text('culprit'),
    firstSeen: timestamp('first_seen')
      .$defaultFn(() => new Date())
      .notNull(),
    lastSeen: timestamp('last_seen')
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('issue_project_fingerprint').on(t.projectId, t.fingerprint),
    index('issue_project_status_last_seen').on(t.projectId, t.status, t.lastSeen),
  ],
)

export const eventTable = pgTable(
  'event',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text('event_id'),
    projectId: text('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    issueId: uuid('issue_id')
      .notNull()
      .references(() => issueTable.id, { onDelete: 'cascade' }),
    level: text('level').notNull().default('error'),
    message: text('message').notNull(),
    environment: text('environment'),
    release: text('release'),
    /** sha256 of the SDK's user id, else email, else IP; null when the event names nobody. */
    userKey: text('user_key'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    receivedAt: timestamp('received_at')
      .$defaultFn(() => new Date())
      .notNull(),
  },
  // SDKs retry envelopes with the same event_id; null ids stay distinct.
  (t) => [
    uniqueIndex('event_project_event_id').on(t.projectId, t.eventId),
    index('event_issue_received').on(t.issueId, t.receivedAt),
    index('event_issue_user').on(t.issueId, t.userKey),
    index('event_project_release').on(t.projectId, t.release, t.receivedAt),
  ],
)
