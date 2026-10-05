import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { projectTable } from './tracker'

/** What an SDK reports as `release`, or a deploy call names; created on first sight. */
export const releaseTable = pgTable(
  'release',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projectTable.id, { onDelete: 'cascade' }),
    version: text('version').notNull(),
    /** `owner/name`; null falls back to the project's linked repository. */
    repository: text('repository'),
    /** Null falls back to the version itself when it reads like a sha. */
    commitSha: text('commit_sha'),
    firstSeen: timestamp('first_seen')
      .$defaultFn(() => new Date())
      .notNull(),
    lastSeen: timestamp('last_seen')
      .$defaultFn(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    /** Null until the commit range was read from GitHub, so a later read can still start it. */
    commitsSyncedAt: timestamp('commits_synced_at'),
  },
  (t) => [
    uniqueIndex('release_project_version').on(t.projectId, t.version),
    index('release_project_first_seen').on(t.projectId, t.firstSeen),
  ],
)

export const deployTable = pgTable(
  'deploy',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    releaseId: uuid('release_id')
      .notNull()
      .references(() => releaseTable.id, { onDelete: 'cascade' }),
    environment: text('environment').notNull(),
    deployedAt: timestamp('deployed_at')
      .$defaultFn(() => new Date())
      .notNull(),
    url: text('url'),
    name: text('name'),
  },
  (t) => [index('deploy_release_deployed').on(t.releaseId, t.deployedAt)],
)

export const releaseCommitTable = pgTable(
  'release_commit',
  {
    releaseId: uuid('release_id')
      .notNull()
      .references(() => releaseTable.id, { onDelete: 'cascade' }),
    sha: text('sha').notNull(),
    message: text('message').notNull(),
    authorName: text('author_name').notNull(),
    authorLogin: text('author_login'),
    authorAvatar: text('author_avatar'),
    committedAt: timestamp('committed_at').notNull(),
    prNumber: integer('pr_number'),
    files: jsonb('files').$type<string[]>().notNull(),
  },
  (t) => [primaryKey({ columns: [t.releaseId, t.sha] })],
)
