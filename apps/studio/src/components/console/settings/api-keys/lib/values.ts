import type { ApiKeyTab } from './types'

export const API_KEY_TABS: { value: ApiKeyTab; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'revoked', label: 'Revoked' },
]
