import { type Review, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { eq } from 'drizzle-orm'
import { announce } from '../../realtime'

export const completeReview = async (
  id: string,
  data: Pick<Review, 'status' | 'verdict' | 'summary' | 'model'> &
    Partial<
      Pick<Review, 'inputTokens' | 'outputTokens' | 'reasoningTokens' | 'diffScope' | 'deltaFrom'>
    >,
): Promise<Review | undefined> => {
  const review = await db
    .update(reviewTable)
    .set({ ...data, completedAt: new Date() })
    .where(eq(reviewTable.id, id))
    .returning()
    .then(([r]) => r)
  announce('reviews')
  return review
}
