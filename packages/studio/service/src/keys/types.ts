export interface ApiKeyRecord {
  id: string
  name: string
  prefix: string
  scope: 'read' | 'loop'
  lastUsedAt: Date | null
  revokedAt: Date | null
  createdAt: Date
}

export interface ApiKeyCaller {
  keyId: string
  name: string
  userId: string
  scope: 'read' | 'loop'
}

export interface CreatedApiKey {
  id: string
  key: string
}
