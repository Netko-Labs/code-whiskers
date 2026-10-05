import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'

/**
 * A view someone wants back: which section and what was typed. `params` is the whole search of
 * the logs and traces explorers; `tab`, `query` and `service` stay for issue views.
 */
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
    params: jsonb('params').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('saved_query_user').on(t.userId)],
)
