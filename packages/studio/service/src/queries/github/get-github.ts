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

export const isInstallationMember = async (
  userId: string,
  installationId: number,
): Promise<boolean> => {
  const [row] = await db
    .select({ userId: organizationMember.userId })
    .from(organizationMember)
    .where(
      and(
        eq(organizationMember.userId, userId),
        eq(organizationMember.installationId, installationId),
      ),
    )
    .limit(1)
  return !!row
}

/** Whether whiskers should review this repository; null when studio has never synced it. */
export const getRepositoryWatch = async (slug: string): Promise<boolean | null> => {
  const [owner, name] = slug.split('/')
  if (!owner || !name) return null
  const [row] = await db
    .select({ isWatched: repository.isWatched })
    .from(repository)
    .where(
      and(
        eq(sql`lower(${repository.owner})`, owner.toLowerCase()),
        eq(sql`lower(${repository.name})`, name.toLowerCase()),
      ),
    )
    .limit(1)
  return row ? row.isWatched : null
}

/**
 * Anyone with a GitHub account can sign in, so signing in is not access. A user reads the
 * worker's data once they belong to an installation — except on a fresh instance with none
 * synced yet, where the first operator has to get in to connect one.
 */
export const hasInstanceAccess = async (userId: string): Promise<boolean> => {
  const [member] = await db
    .select({ userId: organizationMember.userId })
    .from(organizationMember)
    .where(eq(organizationMember.userId, userId))
    .limit(1)
  if (member) return true
  const [anyInstallation] = await db
    .select({ installationId: organization.installationId })
    .from(organization)
    .limit(1)
  return !anyInstallation
}
