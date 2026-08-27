import { type Review, type ReviewInsert, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'

export const createReview = async (data: ReviewInsert): Promise<Review | undefined> => {
  return await db
    .insert(reviewTable)
    .values(data)
    .returning()
    .then(([r]) => r)
}
