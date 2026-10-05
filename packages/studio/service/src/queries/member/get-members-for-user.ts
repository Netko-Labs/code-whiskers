import { organization, organizationMember, session, user } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq, inArray, max } from 'drizzle-orm'
import type { Member } from './types'
import { membersFromRows } from './utils'

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
      githubLogin: user.githubLogin,
      login: organization.login,
      accountType: organization.accountType,
      syncedAt: organizationMember.syncedAt,
    })
    .from(organizationMember)
    .innerJoin(user, eq(user.id, organizationMember.userId))
    .innerJoin(organization, eq(organization.installationId, organizationMember.installationId))
    .where(inArray(organizationMember.installationId, mine))

  const ids = [...new Set(rows.map((row) => row.id))]
  const sessions = ids.length
    ? await db
        .select({ userId: session.userId, lastActiveAt: max(session.updatedAt) })
        .from(session)
        .where(inArray(session.userId, ids))
        .groupBy(session.userId)
    : []
  const lastActive = new Map(
    sessions.flatMap((row) => (row.lastActiveAt ? [[row.userId, row.lastActiveAt] as const] : [])),
  )
  return membersFromRows(rows, lastActive)
}
