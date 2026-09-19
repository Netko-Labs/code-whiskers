import { relations } from 'drizzle-orm'
import { bigint, boolean, index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'

/**
 * An account CodeWhiskers is installed on — a GitHub org or a personal account.
 * Keyed by the installation, because that is what grants access to the repos;
 * an org we can see but are not installed on has nothing to show.
 */
export const organization = pgTable('organization', {
  installationId: bigint('installation_id', { mode: 'number' }).primaryKey(),
  login: text('login').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  accountType: text('account_type', { enum: ['User', 'Organization'] }).notNull(),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
})

/** Which signed-in users can see which installation. */
export const organizationMember = pgTable(
  'organization_member',
  {
    installationId: bigint('installation_id', { mode: 'number' })
      .notNull()
      .references(() => organization.installationId, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    syncedAt: timestamp('synced_at').defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.installationId, t.userId] }),
    index('organization_member_user').on(t.userId),
  ],
)

export const repository = pgTable(
  'repository',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    installationId: bigint('installation_id', { mode: 'number' })
      .notNull()
      .references(() => organization.installationId, { onDelete: 'cascade' }),
    owner: text('owner').notNull(),
    name: text('name').notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    language: text('language'),
    defaultBranch: text('default_branch'),
    pushedAt: timestamp('pushed_at'),
    syncedAt: timestamp('synced_at').defaultNow().notNull(),
  },
  (t) => [index('repository_installation').on(t.installationId)],
)

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(organizationMember),
  repositories: many(repository),
}))

export const repositoryRelations = relations(repository, ({ one }) => ({
  organization: one(organization, {
    fields: [repository.installationId],
    references: [organization.installationId],
  }),
}))
