import {
  type Finding,
  findingTable,
  type Review,
  reviewTable,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { eq } from 'drizzle-orm'

export const getReview = async (
  id: string,
): Promise<{ review: Review; findings: Finding[] } | undefined> => {
  const review = await db
    .select()
    .from(reviewTable)
    .where(eq(reviewTable.id, id))
    .then(([r]) => r)
  if (!review) return undefined
  const findings = await db.select().from(findingTable).where(eq(findingTable.reviewId, id))
  return { review, findings }
}
