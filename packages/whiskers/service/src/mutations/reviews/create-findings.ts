import { type Finding, type FindingInsert, findingTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, eq } from 'drizzle-orm'

export const createFindings = async (data: FindingInsert[]): Promise<Finding[]> => {
  if (data.length === 0) return []
  return await db.insert(findingTable).values(data).returning()
}

/** A retried attempt writes its own findings; the failed one's must not linger beside them. */
export const clearFindings = async (reviewId: string): Promise<void> => {
  await db.delete(findingTable).where(eq(findingTable.reviewId, reviewId))
}

/** Thread URLs by finding id, once GitHub has the review's inline comments. */
export const linkFindingThreads = async (
  reviewId: string,
  urls: Map<string, string>,
): Promise<void> => {
  for (const [fingerprint, threadUrl] of urls) {
    await db
      .update(findingTable)
      .set({ threadUrl })
      .where(and(eq(findingTable.reviewId, reviewId), eq(findingTable.fingerprint, fingerprint)))
  }
}
