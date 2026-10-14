import type {
  ReviewerCredentialPresence,
  ReviewerProvider,
  ReviewerSettings,
} from '@/integrations/studio-api'

export type ReviewerField = keyof ReviewerSettings

/** Every field as the input holds it; empty means inherit. */
export type ReviewerDraft = Record<ReviewerField, string>

export type ReviewerTextFieldSpec = {
  field: Exclude<ReviewerField, 'provider' | 'effort'>
  label: string
  description: string
  placeholder: string
  inputMode: 'text' | 'numeric' | 'decimal'
  /** Whose models.dev list to search: the review provider's, or a fixed one. */
  catalog?: 'review' | ReviewerProvider
}

export type ReviewerSettingsForm = {
  draft: ReviewerDraft
  error: string | null
  isDirty: boolean
  isPending: boolean
  isLoading: boolean
  isError: boolean
  retry: () => void
  activeProvider: ReviewerProvider | null
  setField: (field: ReviewerField, value: string) => void
  reset: () => void
  save: () => void
}

export type ReviewerTextFieldProps = {
  spec: ReviewerTextFieldSpec
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export type ReviewerModelFieldProps = Omit<ReviewerTextFieldProps, 'onSubmit'> & {
  provider: ReviewerProvider | null
}

export type ReviewerCredentialForm = {
  value: string
  isPending: boolean
  setValue: (value: string) => void
  save: () => void
  remove: () => void
}

/** Stored in studio, held by the worker's env only, missing for the active provider, or unused. */
export type ReviewerCredentialState = 'stored' | 'env' | 'needed' | 'unset'

export type ReviewerCredentialRowProps = {
  credential: ReviewerCredentialPresence
  state: ReviewerCredentialState
}
