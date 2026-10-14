import type { ReviewerCredentialName, ReviewerSettings } from '@code-whiskers/studio-domain'

export interface ReviewerSettingRow {
  key: string
  value: unknown
  updatedAt: Date
}

export interface ReviewerCredentialPresence {
  name: ReviewerCredentialName
  isSet: boolean
  updatedAt: Date | null
}

export interface ReviewerSettingsRecord {
  settings: ReviewerSettings
  credentials: ReviewerCredentialPresence[]
  /** Null while every knob still inherits. */
  updatedAt: Date | null
}

/** Only ever sent to whiskers over `/api/internal/reviewer`. */
export interface ReviewerSecrets {
  settings: ReviewerSettings
  credentials: Partial<Record<ReviewerCredentialName, string>>
}
