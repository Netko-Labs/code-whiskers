import { bigint, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'

/**
 * A human's decision about machine output. Whiskers produces the finding; this
 * records that somebody resolved, approved, snoozed or argued with it, which is
 * why it lives on the source-of-truth side and references whiskers by id with
 * no foreign key.
 */
export const triageState = pgTable(
  'triage_state',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    installationId: bigint('installation_id', { mode: 'number' }),
    /** `owner/repo` for a review, project id for an issue — what to match on. */
    scope: text('scope').notNull(),
    itemKind: text('item_kind', { enum: ['issue', 'review', 'log', 'finding'] }).notNull(),
    /** The whiskers row, or for a dismissed finding, `file:title`. */
    itemRef: text('item_ref').notNull(),
    status: text('status', {
      enum: ['open', 'resolved', 'snoozed', 'tracked', 'approved', 'dismissed'],
    }).notNull(),
    assigneeUserId: text('assignee_user_id').references(() => user.id, { onDelete: 'set null' }),
    snoozedUntil: timestamp('snoozed_until'),
    /** Why a human disagreed — the reviewer is told this, not just the verdict. */
    note: text('note'),
    updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('triage_state_item').on(t.scope, t.itemKind, t.itemRef),
    index('triage_state_scope').on(t.scope),
  ],
)
