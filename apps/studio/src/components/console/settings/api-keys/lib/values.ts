import type { ApiKeyTab } from './types'

export const API_KEY_TABS: { value: ApiKeyTab; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'revoked', label: 'Revoked' },
]

export const SCOPE_LABEL = {
  read: 'Read-only · /v1',
  loop: 'Review loop · MCP',
} as const
