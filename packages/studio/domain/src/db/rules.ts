import { bigint, boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { organization } from './github'

/**
 * A reviewing instruction written by a human, in English. The reviewer reads every unmuted rule
 * for the installation a repository belongs to; `scope` narrows it to matching paths.
 */
export const reviewRule = pgTable(
  'review_rule',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    installationId: bigint('installation_id', { mode: 'number' })
      .notNull()
      .references(() => organization.installationId, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    scope: text('scope').notNull().default('**'),
    effect: text('effect', { enum: ['blocker', 'suggestion', 'filter', 'tone'] }).notNull(),
    isMuted: boolean('is_muted').default(false).notNull(),
    authorUserId: text('author_user_id').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index('review_rule_installation').on(t.installationId)],
)
