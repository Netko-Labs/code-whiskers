import { organization, organizationMember, repository } from '@code-whiskers/studio-domain'
import { sql } from 'drizzle-orm'
import type { OrganizationInput, RepositoryInput, Transaction } from './types'

/** `excluded` is the row postgres would have inserted — the standard upsert idiom. */
const sqlExcluded = (column: string) => sql.raw(`excluded."${column}"`)

export const upsertOrganizations = async (
  tx: Transaction,
  rows: OrganizationInput[],
): Promise<void> => {
  if (rows.length === 0) return
  await tx
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
  tx: Transaction,
  userId: string,
  installationIds: number[],
): Promise<void> => {
  if (installationIds.length === 0) return
  await tx
    .insert(organizationMember)
    .values(installationIds.map((installationId) => ({ installationId, userId })))
    .onConflictDoUpdate({
      target: [organizationMember.installationId, organizationMember.userId],
      set: { syncedAt: new Date() },
    })
}

/** `is_watched` is the operator's choice, so an upsert must never reset it. */
export const upsertRepositories = async (
  tx: Transaction,
  rows: RepositoryInput[],
): Promise<void> => {
  if (rows.length === 0) return
  await tx
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
