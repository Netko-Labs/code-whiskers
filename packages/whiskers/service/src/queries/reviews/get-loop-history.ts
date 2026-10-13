import {
  type Finding,
  findingTable,
  type Review,
  reviewTable,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, asc, eq, inArray } from 'drizzle-orm'

/** Every completed round of a pull request, oldest first, with each round's findings. */
export const getLoopHistory = async (
  owner: string,
  repo: string,
  prNumber: number,
): Promise<{ reviews: Review[]; findings: Finding[] }> => {
  const reviews = await db
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
    .orderBy(asc(reviewTable.createdAt))
  if (reviews.length === 0) return { reviews, findings: [] }
  const findings = await db
    .select()
    .from(findingTable)
    .where(
      inArray(
        findingTable.reviewId,
        reviews.map((review) => review.id),
      ),
    )
  return { reviews, findings }
}
