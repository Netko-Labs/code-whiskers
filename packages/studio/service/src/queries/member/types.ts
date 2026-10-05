export type MemberRole = 'owner' | 'member'

export interface Member {
  id: string
  name: string
  image: string | null
  /** Null until the member's next GitHub sync records it. */
  githubLogin: string | null
  /** `owner` when one of the shared installations is their own personal account. */
  role: MemberRole
  organizations: string[]
  lastSyncedAt: Date
  /** Latest session activity; null once every session has expired away. */
  lastActiveAt: Date | null
}

export interface MemberRow {
  id: string
  name: string
  image: string | null
  githubLogin: string | null
  login: string
  accountType: 'User' | 'Organization'
  syncedAt: Date
}
