import { createLogger } from '@code-whiskers/logger'
import { decrypt } from '../../shared'
import { REVIEWER_SETTINGS_KEY } from './constants'
import type { ReviewerSecrets } from './types'
import { credentialNameOf, readReviewerRows, settingsFrom } from './utils'

const logger = createLogger('studio-reviewer')

/** Decrypted for whiskers alone. A key that no longer decrypts (ENCRYPTION_KEY changed) is skipped. */
export const getReviewerSecrets = async (): Promise<ReviewerSecrets> => {
  const rows = await readReviewerRows()
  const credentials: ReviewerSecrets['credentials'] = {}
  for (const row of rows) {
    const name = credentialNameOf(row.key)
    if (!name || typeof row.value !== 'string') continue
    try {
      credentials[name] = decrypt(row.value)
    } catch {
      logger.warn({ name }, 'stored reviewer credential does not decrypt; save it again')
    }
  }
  const settingsRow = rows.find((row) => row.key === REVIEWER_SETTINGS_KEY)
  return { settings: settingsFrom(settingsRow?.value), credentials }
}
