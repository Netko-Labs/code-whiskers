import { type ReviewerSettings, setting } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import {
  getReviewerSettings,
  REVIEWER_SETTINGS_KEY,
  type ReviewerSettingsRecord,
} from '../../queries/reviewer'

export const updateReviewerSettings = async (
  userId: string,
  input: ReviewerSettings,
): Promise<ReviewerSettingsRecord> => {
  const updatedAt = new Date()
  await db
    .insert(setting)
    .values({ key: REVIEWER_SETTINGS_KEY, value: input, updatedBy: userId, updatedAt })
    .onConflictDoUpdate({
      target: setting.key,
      set: { value: input, updatedBy: userId, updatedAt },
    })
  return getReviewerSettings()
}
