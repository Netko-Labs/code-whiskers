import { sql } from 'drizzle-orm'
import {
  bigint,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { MEMORY_ACTIONS, MEMORY_KINDS, MEMORY_SOURCES, MEMORY_STATUSES } from '../schemas/memory'
import { user } from './auth'
import { organization, repository } from './github'

const tsvector = customType<{ data: string }>({ dataType: () => 'tsvector' })

/**
 * What the reviewer knows about a codebase, in a sentence or three a human can read and edit.
 * No repository means the whole installation; `paths` (globs) narrow it to matching files.
 */
export const memoryNote = pgTable(
  'memory_note',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    installationId: bigint('installation_id', { mode: 'number' })
      .notNull()
      .references(() => organization.installationId, { onDelete: 'cascade' }),
    repositoryId: bigint('repository_id', { mode: 'number' }).references(() => repository.id, {
      onDelete: 'cascade',
    }),
    kind: text('kind', { enum: MEMORY_KINDS }).notNull(),
    body: text('body').notNull(),
    paths: text('paths').array().notNull().default([]),
    source: text('source', { enum: MEMORY_SOURCES }).notNull(),
    sourceUrl: text('source_url'),
    authorUserId: text('author_user_id').references(() => user.id, { onDelete: 'set null' }),
    /** Who wrote it when no user did: a GitHub login, `whiskers`, an agent name. */
    authorLabel: text('author_label'),
    status: text('status', { enum: MEMORY_STATUSES }).notNull().default('active'),
    uses: integer('uses').notNull().default(0),
    lastUsedAt: timestamp('last_used_at'),
    search: tsvector('search').generatedAlwaysAs(sql`to_tsvector('english', "body")`),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('memory_note_installation').on(t.installationId, t.status),
    index('memory_note_repository').on(t.repositoryId),
    index('memory_note_search').using('gin', t.search),
  ],
)

/**
 * Every change to a note, with the note as it was before and after, so a human auditing what
 * the reviewer learned can undo any step. Outlives the note: no foreign key on `note_id`.
 */
export const memoryActivity = pgTable(
  'memory_activity',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    installationId: bigint('installation_id', { mode: 'number' })
      .notNull()
      .references(() => organization.installationId, { onDelete: 'cascade' }),
    noteId: uuid('note_id').notNull(),
    action: text('action', { enum: MEMORY_ACTIONS }).notNull(),
    actorUserId: text('actor_user_id').references(() => user.id, { onDelete: 'set null' }),
    actorLabel: text('actor_label'),
    before: jsonb('before'),
    after: jsonb('after'),
    undoneAt: timestamp('undone_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('memory_activity_installation').on(t.installationId, t.createdAt)],
)
