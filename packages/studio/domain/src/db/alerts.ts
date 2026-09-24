import { bigint, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { organization } from './github'

/**
 * A condition whiskers evaluates every minute and studio delivers when it holds. Studio keeps the
 * rule and the webhook secrets; whiskers only ever sees the condition.
 */
export const alertRule = pgTable(
  'alert_rule',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    installationId: bigint('installation_id', { mode: 'number' })
      .notNull()
      .references(() => organization.installationId, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    kind: text('kind', {
      enum: ['new_issue', 'error_rate', 'review_failed', 'blocking_review'],
    }).notNull(),
    projectId: text('project_id'),
    threshold: integer('threshold').notNull().default(1),
    windowMinutes: integer('window_minutes').notNull().default(5),
    state: text('state', { enum: ['armed', 'firing', 'muted'] })
      .notNull()
      .default('armed'),
    lastFiredAt: timestamp('last_fired_at'),
    lastEvaluatedAt: timestamp('last_evaluated_at'),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('alert_rule_installation').on(t.installationId)],
)
