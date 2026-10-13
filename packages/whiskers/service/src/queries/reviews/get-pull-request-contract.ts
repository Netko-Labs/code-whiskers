import { findingTable, type ReviewContract, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, count, desc, eq, lt } from 'drizzle-orm'
import { contractOfReview } from '../../review/loop'

/** What the latest completed review of a PR asks of whoever is fixing it. */
export const getPullRequestContract = async (
  owner: string,
  repo: string,
  prNumber: number,
): Promise<ReviewContract | undefined> => {
  const review = await db
    .select()
    .from(reviewTable)
    .where(
      and(
        eq(reviewTable.owner, owner),
        eq(reviewTable.repo, repo),
        eq(reviewTable.prNumber, prNumber),
        eq(reviewTable.status, 'completed'),
      ),
    )
    .orderBy(desc(reviewTable.createdAt))
    .limit(1)
    .then(([row]) => row)
  if (!review) return undefined
  const findings = await db.select().from(findingTable).where(eq(findingTable.reviewId, review.id))
  return contractOfReview(review, findings)
}

/** 1 + the completed reviews before `before`: a failed attempt is not a round of the loop. */
export const getReviewRound = async (
  owner: string,
  repo: string,
  prNumber: number,
  before = new Date(),
): Promise<number> => {
  const [row] = await db
    .select({ completed: count() })
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
  return (row?.completed ?? 0) + 1
}
