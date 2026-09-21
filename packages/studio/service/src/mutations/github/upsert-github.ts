import { organization, organizationMember, repository } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { sql } from 'drizzle-orm'

/** `excluded` is the row postgres would have inserted — the standard upsert idiom. */
const sqlExcluded = (column: string) => sql.raw(`excluded."${column}"`)

export type OrganizationInput = typeof organization.$inferInsert
export type RepositoryInput = typeof repository.$inferInsert

export const upsertOrganizations = async (rows: OrganizationInput[]): Promise<void> => {
  if (rows.length === 0) return
  await db
    .insert(organization)
    .values(rows)
    .onConflictDoUpdate({
      target: organization.installationId,
      set: {
        login: sqlExcluded('login'),
        name: sqlExcluded('name'),
        avatarUrl: sqlExcluded('avatar_url'),
        accountType: sqlExcluded('account_type'),
        syncedAt: new Date(),
      },
    })
}

export const upsertMemberships = async (
  userId: string,
  installationIds: number[],
): Promise<void> => {
  if (installationIds.length === 0) return
  await db
    .insert(organizationMember)
    .values(installationIds.map((installationId) => ({ installationId, userId })))
    .onConflictDoUpdate({
      target: [organizationMember.installationId, organizationMember.userId],
      set: { syncedAt: new Date() },
    })
}

/** `is_watched` is the operator's choice, so an upsert must never reset it. */
export const upsertRepositories = async (rows: RepositoryInput[]): Promise<void> => {
  if (rows.length === 0) return
  await db
    .insert(repository)
    .values(rows)
    .onConflictDoUpdate({
      target: repository.id,
      set: {
        installationId: sqlExcluded('installation_id'),
        owner: sqlExcluded('owner'),
        name: sqlExcluded('name'),
        isPrivate: sqlExcluded('is_private'),
        language: sqlExcluded('language'),
        defaultBranch: sqlExcluded('default_branch'),
        pushedAt: sqlExcluded('pushed_at'),
        syncedAt: new Date(),
      },
    })
}
