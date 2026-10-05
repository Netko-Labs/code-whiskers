import { projectKeyTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { eq } from 'drizzle-orm'
import { KEY_TOUCH_INTERVAL_MS } from './constants'

const touchedAt = new Map<string, number>()

export function isTouchDue(keyId: string, now: number): boolean {
  const last = touchedAt.get(keyId)
  if (last !== undefined && now - last < KEY_TOUCH_INTERVAL_MS) return false
  touchedAt.set(keyId, now)
  return true
}

/** Fire-and-forget: a lost `last_used_at` write never fails the event it rode in on. */
export function touchKey(keyId: string): void {
  const now = Date.now()
  if (!isTouchDue(keyId, now)) return
  void db
    .update(projectKeyTable)
    .set({ lastUsedAt: new Date(now) })
    .where(eq(projectKeyTable.id, keyId))
    .catch(() => touchedAt.delete(keyId))
}
