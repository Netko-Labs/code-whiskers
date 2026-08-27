import { type Review, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { eq } from 'drizzle-orm'

export const completeReview = async (
  id: string,
  data: Pick<Review, 'status' | 'verdict' | 'summary' | 'model'>,
): Promise<Review | undefined> => {
  return await db
    .update(reviewTable)
    .set({ ...data, completedAt: new Date() })
    .where(eq(reviewTable.id, id))
    .returning()
    .then(([r]) => r)
}
