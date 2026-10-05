import type { Integration, IntegrationKind, Organization } from '@/integrations/studio-api'

export type DestinationsModel = {
  destinations: Integration[]
  installations: Organization[]
  isLoading: boolean
  isError: boolean
  retry: () => void
  testingId: string | null
  test: (destination: Integration) => void
  remove: (destination: Integration) => void
}

export type DestinationRowProps = {
  destination: Integration
  isTesting: boolean
  isOrgShown: boolean
  onTest: () => void
  onRemove: () => void
}

export type AddDestinationDialogProps = {
  installations: Organization[]
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export type DestinationKindOption = {
  value: IntegrationKind
  label: string
  placeholder: string
  hint: string
}

export type AddDestinationForm = {
  kind: IntegrationKind
  name: string
  url: string
  installationId: string
  error: string | null
  isPending: boolean
  canSubmit: boolean
  setKind: (kind: IntegrationKind) => void
  setName: (name: string) => void
  setUrl: (url: string) => void
  setInstallationId: (id: string) => void
  submit: () => void
}

export type DestinationFields = {
  kind: IntegrationKind
  name: string
  url: string
  installationId: string
}
