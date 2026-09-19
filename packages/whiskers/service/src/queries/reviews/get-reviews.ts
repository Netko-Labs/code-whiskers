import { findingTable, type Review, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { count, desc, eq } from 'drizzle-orm'

export type ReviewWithFindingCount = Review & { findingCount: number }

/**
 * The dashboard lists reviews with their finding count; a per-row fetch would be N+1.
 * Joined rather than correlated — drizzle renders a correlated subquery's columns
 * unqualified, so the inner table shadows the outer one and the count is always 0.
 */
export const getReviews = async (): Promise<ReviewWithFindingCount[]> => {
  const rows = await db
    .select({ review: reviewTable, findingCount: count(findingTable.id) })
    .from(reviewTable)
    .leftJoin(findingTable, eq(findingTable.reviewId, reviewTable.id))
    .groupBy(reviewTable.id)
    .orderBy(desc(reviewTable.createdAt))
    .limit(100)

  return rows.map(({ review, findingCount }) => ({ ...review, findingCount }))
}
