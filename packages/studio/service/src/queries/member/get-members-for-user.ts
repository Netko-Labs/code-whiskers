import { organization, organizationMember, user } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq, inArray } from 'drizzle-orm'
import type { Member } from './types'

/** Everyone who shares at least one installation with this user, with the ones they share. */
export const getMembersForUser = async (userId: string): Promise<Member[]> => {
  const mine = db
    .select({ installationId: organizationMember.installationId })
    .from(organizationMember)
    .where(eq(organizationMember.userId, userId))

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      login: organization.login,
      syncedAt: organizationMember.syncedAt,
    })
    .from(organizationMember)
    .innerJoin(user, eq(user.id, organizationMember.userId))
    .innerJoin(organization, eq(organization.installationId, organizationMember.installationId))
    .where(inArray(organizationMember.installationId, mine))

  const byUser = new Map<string, Member>()
  for (const row of rows) {
    const member = byUser.get(row.id) ?? {
      id: row.id,
      name: row.name,
      image: row.image,
      organizations: [],
      lastSyncedAt: row.syncedAt,
    }
    member.organizations.push(row.login)
    if (row.syncedAt > member.lastSyncedAt) member.lastSyncedAt = row.syncedAt
    byUser.set(row.id, member)
  }
  return [...byUser.values()].sort((a, b) => a.name.localeCompare(b.name))
}
