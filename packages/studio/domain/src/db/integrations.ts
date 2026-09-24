import { bigint, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { organization } from './github'

/** Where alerts go. The URL is a credential (Slack/Discord webhooks are), so it is stored encrypted. */
export const integration = pgTable(
  'integration',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    installationId: bigint('installation_id', { mode: 'number' })
      .notNull()
      .references(() => organization.installationId, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['slack', 'discord', 'webhook'] }).notNull(),
    name: text('name').notNull(),
    urlEncrypted: text('url_encrypted').notNull(),
    urlHost: text('url_host').notNull(),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    lastDeliveredAt: timestamp('last_delivered_at'),
    lastError: text('last_error'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('integration_installation').on(t.installationId)],
)
