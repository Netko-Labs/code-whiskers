import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { API_KEY_SCOPES } from '../schemas/keys'
import { user } from './auth'

/**
 * A key for /v1 reads, or with the `loop` scope for driving the review loop over MCP. Only the
 * hash is stored; the key itself is shown once, at creation.
 */
export const apiKey = pgTable(
  'api_key',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    prefix: text('prefix').notNull(),
    hash: text('hash').notNull(),
    scope: text('scope', { enum: API_KEY_SCOPES }).notNull().default('read'),
    lastUsedAt: timestamp('last_used_at'),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('api_key_hash').on(t.hash), index('api_key_user').on(t.userId)],
)
