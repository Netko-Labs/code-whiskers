import type { ApiKey } from '@/integrations/studio-api'

export type CreatedSecret = {
  name: string
  key: string
}

export type ApiKeyCreateForm = {
  name: string
  error: string | null
  isPending: boolean
  secret: CreatedSecret | null
  setName: (name: string) => void
  submit: () => void
  dismissSecret: () => void
}

export type ApiKeyGroups = {
  active: ApiKey[]
  revoked: ApiKey[]
}

export type ApiKeyListState = ApiKeyGroups & {
  isLoading: boolean
  isError: boolean
  retry: () => void
}

export type ApiKeyRevoke = {
  revoke: (key: ApiKey) => void
}

export type ApiKeyTab = 'active' | 'revoked'

export type ApiKeyCreateProps = {
  form: ApiKeyCreateForm
}

export type ApiKeySecretDialogProps = {
  secret: CreatedSecret | null
  onClose: () => void
}

export type ApiKeyRowProps = {
  apiKey: ApiKey
  onRevoke?: (key: ApiKey) => void
}

export type ApiKeyListProps = {
  keys: ApiKeyListState
  onRevoke: (key: ApiKey) => void
}
