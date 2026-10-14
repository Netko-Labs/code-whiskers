import { type ReviewerCredentialInput, setting } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq } from 'drizzle-orm'
import {
  credentialKey,
  getReviewerSettings,
  type ReviewerSettingsRecord,
} from '../../queries/reviewer'
import { encrypt } from '../../shared'

export const setReviewerCredential = async (
  userId: string,
  input: ReviewerCredentialInput,
): Promise<ReviewerSettingsRecord> => {
  const key = credentialKey(input.name)
  if (input.value === null) {
    await db.delete(setting).where(eq(setting.key, key))
    return getReviewerSettings()
  }
  const value = encrypt(input.value)
  const updatedAt = new Date()
  await db
    .insert(setting)
    .values({ key, value, updatedBy: userId, updatedAt })
    .onConflictDoUpdate({ target: setting.key, set: { value, updatedBy: userId, updatedAt } })
  return getReviewerSettings()
}
