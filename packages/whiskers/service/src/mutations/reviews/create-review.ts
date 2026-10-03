import { type Review, type ReviewInsert, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { announce } from '../../realtime'

export const createReview = async (data: ReviewInsert): Promise<Review | undefined> => {
  const review = await db
    .insert(reviewTable)
    .values(data)
    .returning()
    .then(([r]) => r)
  announce('reviews')
  return review
}
