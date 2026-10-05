import type { Member, MemberRow } from './types'

const isOwnAccount = (row: MemberRow): boolean =>
  row.accountType === 'User' &&
  row.githubLogin !== null &&
  row.githubLogin.toLowerCase() === row.login.toLowerCase()

/** One member per user, with every installation they share and the freshest sync among them. */
export function membersFromRows(rows: MemberRow[], lastActive: Map<string, Date>): Member[] {
  const byUser = new Map<string, Member>()
  for (const row of rows) {
    const member = byUser.get(row.id) ?? {
      id: row.id,
      name: row.name,
      image: row.image,
      githubLogin: row.githubLogin,
      role: 'member',
      organizations: [],
      lastSyncedAt: row.syncedAt,
      lastActiveAt: lastActive.get(row.id) ?? null,
    }
    member.organizations.push(row.login)
    if (isOwnAccount(row)) member.role = 'owner'
    if (row.syncedAt > member.lastSyncedAt) member.lastSyncedAt = row.syncedAt
    byUser.set(row.id, member)
  }
  return [...byUser.values()].sort((a, b) => a.name.localeCompare(b.name))
}
