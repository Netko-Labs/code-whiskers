import { organization, organizationMember, repository } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { desc, eq, inArray } from 'drizzle-orm'

export type Organization = typeof organization.$inferSelect
export type Repository = typeof repository.$inferSelect

/** Only the installations this user is a member of — never the whole table. */
export const getOrganizationsForUser = async (userId: string): Promise<Organization[]> => {
  return await db
    .select({
      installationId: organization.installationId,
      login: organization.login,
      name: organization.name,
      avatarUrl: organization.avatarUrl,
      accountType: organization.accountType,
      syncedAt: organization.syncedAt,
    })
    .from(organization)
    .innerJoin(
      organizationMember,
      eq(organizationMember.installationId, organization.installationId),
    )
    .where(eq(organizationMember.userId, userId))
    .orderBy(organization.login)
}

export const getRepositoriesForUser = async (userId: string): Promise<Repository[]> => {
  const installations = await db
    .select({ installationId: organizationMember.installationId })
    .from(organizationMember)
    .where(eq(organizationMember.userId, userId))
  if (installations.length === 0) return []

  return await db
    .select()
    .from(repository)
    .where(
      inArray(
        repository.installationId,
        installations.map((i) => i.installationId),
      ),
    )
    .orderBy(desc(repository.pushedAt))
    .limit(200)
}
