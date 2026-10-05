import {
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { TRIAGE_ACTIVITY_KINDS, TRIAGE_ITEM_KINDS, TRIAGE_STATUSES } from '../schemas/triage'
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
    itemKind: text('item_kind', { enum: TRIAGE_ITEM_KINDS }).notNull(),
    /** The whiskers row, or for a dismissed finding, `file:title`. */
    itemRef: text('item_ref').notNull(),
    status: text('status', { enum: TRIAGE_STATUSES }).notNull(),
    assigneeUserId: text('assignee_user_id').references(() => user.id, { onDelete: 'set null' }),
    snoozedUntil: timestamp('snoozed_until'),
    /** Issues only: `now` | `next_release`. */
    resolveMode: text('resolve_mode'),
    /** Issues only: `forever` | `until` | `events` | `users`, with its ISO time or count. */
    archiveMode: text('archive_mode'),
    archiveValue: text('archive_value'),
    /** Issues only: when whiskers last took this decision; null means it still has to. */
    mirroredAt: timestamp('mirrored_at'),
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

/** A human conversation on a triage item; keyed like the decision, never by whiskers FK. */
export const triageComment = pgTable(
  'triage_comment',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    scope: text('scope').notNull(),
    itemKind: text('item_kind', { enum: TRIAGE_ITEM_KINDS }).notNull(),
    itemRef: text('item_ref').notNull(),
    authorUserId: text('author_user_id').references(() => user.id, { onDelete: 'set null' }),
    body: text('body').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('triage_comment_item').on(t.scope, t.itemKind, t.itemRef, t.createdAt)],
)

/** What happened to a triage item and who did it; a null actor is whiskers (a regression). */
export const triageActivity = pgTable(
  'triage_activity',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    scope: text('scope').notNull(),
    itemKind: text('item_kind', { enum: TRIAGE_ITEM_KINDS }).notNull(),
    itemRef: text('item_ref').notNull(),
    kind: text('kind', { enum: TRIAGE_ACTIVITY_KINDS }).notNull(),
    actorUserId: text('actor_user_id').references(() => user.id, { onDelete: 'set null' }),
    data: jsonb('data').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('triage_activity_item').on(t.scope, t.itemKind, t.itemRef, t.createdAt)],
)
