import { findingTable, type Review, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { count, desc, eq, sql } from 'drizzle-orm'

/** Every push is a review, so a busy month outgrows 100 quickly; the console keeps one per PR. */
const REVIEW_LIST_LIMIT = 500

export type SeverityCounts = { critical: number; high: number; medium: number; low: number }

export type ReviewWithFindingCount = Review & {
  findingCount: number
  findingsBySeverity: SeverityCounts
}

const countOf = (severity: keyof SeverityCounts) =>
  sql<number>`count(*) filter (where ${findingTable.severity} = ${severity})`.mapWith(Number)

/**
 * The dashboard lists reviews with their finding count; a per-row fetch would be N+1.
 * Joined rather than correlated — drizzle renders a correlated subquery's columns
 * unqualified, so the inner table shadows the outer one and the count is always 0.
 */
export const getReviews = async (): Promise<ReviewWithFindingCount[]> => {
  const rows = await db
    .select({
      review: reviewTable,
      findingCount: count(findingTable.id),
      critical: countOf('critical'),
      high: countOf('high'),
      medium: countOf('medium'),
      low: countOf('low'),
    })
    .from(reviewTable)
    .leftJoin(findingTable, eq(findingTable.reviewId, reviewTable.id))
    .groupBy(reviewTable.id)
    .orderBy(desc(reviewTable.createdAt))
    .limit(REVIEW_LIST_LIMIT)

  return rows.map(({ review, findingCount, critical, high, medium, low }) => ({
    ...review,
    findingCount,
    findingsBySeverity: { critical, high, medium, low },
  }))
}
