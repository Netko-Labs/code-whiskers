export interface Member {
  id: string
  name: string
  image: string | null
  organizations: string[]
  lastSyncedAt: Date
}
