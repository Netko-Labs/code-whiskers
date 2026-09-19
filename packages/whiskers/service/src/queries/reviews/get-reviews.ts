import { type Review, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { desc } from 'drizzle-orm'

export const getReviews = async (): Promise<Review[]> => {
  return await db.select().from(reviewTable).orderBy(desc(reviewTable.createdAt)).limit(100)
}
