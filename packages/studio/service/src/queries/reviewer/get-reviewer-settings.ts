import { REVIEWER_CREDENTIALS } from '@code-whiskers/studio-domain'
import { REVIEWER_SETTINGS_KEY } from './constants'
import type { ReviewerSettingsRecord } from './types'
import { credentialNameOf, readReviewerRows, settingsFrom } from './utils'

/** Credentials as presence only — this is what the console sees. */
export const getReviewerSettings = async (): Promise<ReviewerSettingsRecord> => {
  const rows = await readReviewerRows()
  const settingsRow = rows.find((row) => row.key === REVIEWER_SETTINGS_KEY)
  const stored = new Map(rows.map((row) => [credentialNameOf(row.key), row.updatedAt]))
  return {
    settings: settingsFrom(settingsRow?.value),
    credentials: REVIEWER_CREDENTIALS.map((name) => ({
      name,
      isSet: stored.has(name),
      updatedAt: stored.get(name) ?? null,
    })),
    updatedAt: settingsRow?.updatedAt ?? null,
  }
}
