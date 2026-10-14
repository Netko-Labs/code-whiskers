import type { ReviewerSettings } from '@code-whiskers/studio-domain'

export const REVIEWER_KEY_PREFIX = 'reviewer.'
export const REVIEWER_SETTINGS_KEY = 'reviewer.settings'
export const REVIEWER_CREDENTIAL_PREFIX = 'reviewer.credential.'

export const INHERITED_REVIEWER_SETTINGS: ReviewerSettings = {
  provider: null,
  model: null,
  verifyModel: null,
  mentionProvider: null,
  mentionModel: null,
  effort: null,
  maxTurns: null,
  maxBudgetUsd: null,
}
