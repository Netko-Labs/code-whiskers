import type { ApiKey } from '@/integrations/studio-api'
import type { ApiKeyGroups } from './types'

export function groupApiKeys(keys: ApiKey[]): ApiKeyGroups {
  return {
    active: keys.filter((key) => !key.revokedAt),
    revoked: keys.filter((key) => key.revokedAt),
  }
}

/** The optimistic revoke: the row moves to Revoked before studio confirms. */
export function markRevoked(keys: ApiKey[], id: string, at: Date): ApiKey[] {
  return keys.map((key) => (key.id === id && !key.revokedAt ? { ...key, revokedAt: at } : key))
}

export function curlExample(origin: string): string {
  return `curl -H "Authorization: Bearer cw_…" ${origin}/v1/reviews`
}
