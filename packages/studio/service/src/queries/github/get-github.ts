import { organization, organizationMember, repository } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { RepositoryScope } from '../../shared'

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

/** GitHub names are case-insensitive; the row carries the canonical casing. */
export const getRepositoryForUser = async (
  userId: string,
  scope: RepositoryScope,
): Promise<Repository | null> => {
  const [row] = await db
    .select({ repository })
    .from(repository)
    .innerJoin(organizationMember, eq(organizationMember.installationId, repository.installationId))
    .where(
      and(
        eq(organizationMember.userId, userId),
        eq(sql`lower(${repository.owner})`, scope.owner.toLowerCase()),
        eq(sql`lower(${repository.name})`, scope.name.toLowerCase()),
      ),
    )
    .limit(1)
  return row?.repository ?? null
}
