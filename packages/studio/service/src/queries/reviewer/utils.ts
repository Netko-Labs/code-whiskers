import {
  type ReviewerCredentialName,
  ReviewerCredentialNameSchema,
  type ReviewerSettings,
  ReviewerSettingsSchema,
  setting,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { like } from 'drizzle-orm'
import {
  INHERITED_REVIEWER_SETTINGS,
  REVIEWER_CREDENTIAL_PREFIX,
  REVIEWER_KEY_PREFIX,
} from './constants'
import type { ReviewerSettingRow } from './types'

export const readReviewerRows = (): Promise<ReviewerSettingRow[]> =>
  db
    .select({ key: setting.key, value: setting.value, updatedAt: setting.updatedAt })
    .from(setting)
    .where(like(setting.key, `${REVIEWER_KEY_PREFIX}%`))

/** A row written by an older shape keeps whatever still parses; the rest inherits. */
export function settingsFrom(value: unknown): ReviewerSettings {
  const parsed = ReviewerSettingsSchema.partial().safeParse(value)
  return parsed.success
    ? { ...INHERITED_REVIEWER_SETTINGS, ...parsed.data }
    : INHERITED_REVIEWER_SETTINGS
}

export function credentialKey(name: ReviewerCredentialName): string {
  return `${REVIEWER_CREDENTIAL_PREFIX}${name}`
}

export function credentialNameOf(key: string): ReviewerCredentialName | null {
  if (!key.startsWith(REVIEWER_CREDENTIAL_PREFIX)) return null
  const parsed = ReviewerCredentialNameSchema.safeParse(
    key.slice(REVIEWER_CREDENTIAL_PREFIX.length),
  )
  return parsed.success ? parsed.data : null
}
