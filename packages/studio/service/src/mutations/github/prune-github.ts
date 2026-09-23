import { organization, organizationMember, repository } from '@code-whiskers/studio-domain'
import { and, count, eq, inArray, notExists, notInArray } from 'drizzle-orm'
import type { GithubSnapshot, Transaction } from './types'

/** Drops the user from installations GitHub no longer lists for them; returns those ids. */
export const pruneMemberships = async (
  tx: Transaction,
  userId: string,
  installationIds: number[],
): Promise<number[]> => {
  const dropped = await tx
    .delete(organizationMember)
    .where(
      and(
        eq(organizationMember.userId, userId),
        installationIds.length > 0
          ? notInArray(organizationMember.installationId, installationIds)
          : undefined,
      ),
    )
    .returning({ installationId: organizationMember.installationId })
  return dropped.map((d) => d.installationId)
}

/** An installation nobody can see anymore goes, and its repositories cascade with it. */
export const pruneOrphanOrganizations = async (
  tx: Transaction,
  installationIds: number[],
): Promise<void> => {
  if (installationIds.length === 0) return
  await tx
    .delete(organization)
    .where(
      and(
        inArray(organization.installationId, installationIds),
        notExists(
          tx
            .select({ installationId: organizationMember.installationId })
            .from(organizationMember)
            .where(eq(organizationMember.installationId, organization.installationId)),
        ),
      ),
    )
}

/**
 * GitHub lists only the repositories this user can access, so another member may
 * see more. A sole member's listing is the whole truth; anything else is left alone.
 */
export const pruneRepositories = async (
  tx: Transaction,
  snapshot: GithubSnapshot,
): Promise<void> => {
  if (snapshot.listedInstallationIds.length === 0) return
  const soleMember = await tx
    .select({ installationId: organizationMember.installationId })
    .from(organizationMember)
    .where(inArray(organizationMember.installationId, snapshot.listedInstallationIds))
    .groupBy(organizationMember.installationId)
    .having(eq(count(), 1))

  for (const { installationId } of soleMember) {
    const keep = snapshot.repositories
      .filter((r) => r.installationId === installationId)
      .map((r) => r.id)
    await tx
      .delete(repository)
      .where(
        and(
          eq(repository.installationId, installationId),
          keep.length > 0 ? notInArray(repository.id, keep) : undefined,
        ),
      )
  }
}
