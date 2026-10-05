import { triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, inArray, lte, sql } from 'drizzle-orm'

/**
 * Whiskers took these decisions. A row decided again after `decidedBy` keeps waiting for its own
 * write, and `updated_at` is left alone: mirroring is not a decision.
 */
export const markMirrored = async (ids: string[], decidedBy: Date): Promise<void> => {
  if (ids.length === 0) return
  await db
    .update(triageState)
    .set({ mirroredAt: new Date(), updatedAt: sql`${triageState.updatedAt}` })
    .where(and(inArray(triageState.id, ids), lte(triageState.updatedAt, decidedBy)))
}
