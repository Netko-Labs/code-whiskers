export interface ApiKeyRecord {
  id: string
  name: string
  prefix: string
  lastUsedAt: Date | null
  revokedAt: Date | null
  createdAt: Date
}

export interface CreatedApiKey {
  id: string
  key: string
}
