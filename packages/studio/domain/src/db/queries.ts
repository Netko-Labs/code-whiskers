import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'

/** A telemetry view someone wants back: which section, which tab, what was typed. */
export const savedQuery = pgTable(
  'saved_query',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    section: text('section', { enum: ['live-logs', 'traces', 'issues'] }).notNull(),
    tab: integer('tab').notNull().default(0),
    query: text('query'),
    service: text('service'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('saved_query_user').on(t.userId)],
)
