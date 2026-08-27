import { integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

/**
 * Sentry DSN shape is `http://<publicKey>@host/<projectId>` — the id is the
 * DSN path segment and the key is what SDKs send as `sentry_key`.
 */
export const projectTable = pgTable('project', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
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
    status: text('status', { enum: ['open', 'resolved'] })
      .notNull()
      .default('open'),
    eventCount: integer('event_count').notNull().default(0),
    firstSeen: timestamp('first_seen')
      .$defaultFn(() => new Date())
      .notNull(),
    lastSeen: timestamp('last_seen')
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [uniqueIndex('issue_project_fingerprint').on(t.projectId, t.fingerprint)],
)

export const eventTable = pgTable('event', {
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
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  receivedAt: timestamp('received_at')
    .$defaultFn(() => new Date())
    .notNull(),
})
