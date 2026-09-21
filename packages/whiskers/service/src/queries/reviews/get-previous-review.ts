import {
  type Finding,
  findingTable,
  type Review,
  reviewTable,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, desc, eq, lt, ne } from 'drizzle-orm'

export type PreviousReview = { review: Review; findings: Finding[] }

/**
 * The last completed review of this PR before `before`. A re-review needs to
 * know what it already said, or it reports the same finding on every push.
 */
export const getPreviousReview = async (
  owner: string,
  repo: string,
  prNumber: number,
  before: Date,
): Promise<PreviousReview | undefined> => {
  const review = await db
    .select()
    .from(reviewTable)
    .where(
      and(
        eq(reviewTable.owner, owner),
        eq(reviewTable.repo, repo),
        eq(reviewTable.prNumber, prNumber),
        eq(reviewTable.status, 'completed'),
        lt(reviewTable.createdAt, before),
      ),
    )
    .orderBy(desc(reviewTable.createdAt))
    .limit(1)
    .then(([r]) => r)
  if (!review) return undefined

  const findings = await db.select().from(findingTable).where(eq(findingTable.reviewId, review.id))
  return { review, findings }
}

/** How many times this PR has been reviewed, for the "reviewed 3x before" line. */
export const countReviews = async (
  owner: string,
  repo: string,
  prNumber: number,
  before: Date,
): Promise<number> => {
  const rows = await db
    .select({ id: reviewTable.id })
    .from(reviewTable)
    .where(
      and(
        eq(reviewTable.owner, owner),
        eq(reviewTable.repo, repo),
        eq(reviewTable.prNumber, prNumber),
        ne(reviewTable.status, 'running'),
        lt(reviewTable.createdAt, before),
      ),
    )
  return rows.length
}
