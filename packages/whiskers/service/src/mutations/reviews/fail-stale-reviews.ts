import { reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, eq, lt } from 'drizzle-orm'

// Old enough that no live process is still working on it — a rolling deploy overlaps for minutes.
const STALE_AFTER_MS = 30 * 60 * 1000

/** A review left "running" by a process that died would read as in progress forever. */
export const failStaleReviews = async (now = new Date()): Promise<number> => {
  const rows = await db
    .update(reviewTable)
    .set({
      status: 'failed',
      summary: 'interrupted — the worker restarted mid-review',
      completedAt: now,
    })
    .where(
      and(
        eq(reviewTable.status, 'running'),
        lt(reviewTable.createdAt, new Date(now.getTime() - STALE_AFTER_MS)),
      ),
    )
    .returning({ id: reviewTable.id })
  return rows.length
}
