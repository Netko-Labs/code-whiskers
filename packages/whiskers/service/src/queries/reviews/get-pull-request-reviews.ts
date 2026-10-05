import { type Finding, findingTable, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import type { ReviewWithFindingCount, SeverityCounts } from './get-reviews'

/** A PR rarely sees more pushes than this; older ones fall off the timeline, not the database. */
const PUSH_LIMIT = 100

export type PullRequestReviews = {
  pushes: ReviewWithFindingCount[]
  findings: Finding[]
}

/** Every reviewed push of the pull request `reviewId` belongs to, newest first, with all findings. */
export const getPullRequestReviews = async (
  reviewId: string,
): Promise<PullRequestReviews | undefined> => {
  const anchor = await db
    .select({ owner: reviewTable.owner, repo: reviewTable.repo, prNumber: reviewTable.prNumber })
    .from(reviewTable)
    .where(eq(reviewTable.id, reviewId))
    .then(([row]) => row)
  if (!anchor) return undefined

  const reviews = await db
    .select()
    .from(reviewTable)
    .where(
      and(
        eq(reviewTable.owner, anchor.owner),
        eq(reviewTable.repo, anchor.repo),
        eq(reviewTable.prNumber, anchor.prNumber),
      ),
    )
    .orderBy(desc(reviewTable.createdAt))
    .limit(PUSH_LIMIT)

  const findings = await db
    .select()
    .from(findingTable)
    .where(
      inArray(
        findingTable.reviewId,
        reviews.map((review) => review.id),
      ),
    )
    .orderBy(asc(findingTable.file), asc(findingTable.line))

  const pushes = reviews.map((review) => {
    const findingsBySeverity: SeverityCounts = { critical: 0, high: 0, medium: 0, low: 0 }
    let findingCount = 0
    for (const finding of findings) {
      if (finding.reviewId !== review.id) continue
      findingsBySeverity[finding.severity] += 1
      findingCount += 1
    }
    return { ...review, findingCount, findingsBySeverity }
  })
  return { pushes, findings }
}
