import { type TriageItem, triageActivity, user } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, ne } from 'drizzle-orm'
import { getTriageComments } from './get-triage-comments'
import type { TriageActivityEntry } from './types'
import { latestTimeline } from './utils'

const ACTIVITY_READ_LIMIT = 200

/**
 * One item's newest timeline entries, oldest first: what humans and whiskers did, with each
 * comment in place. A `commented` activity is the comment row itself, so it is read from the
 * comments.
 */
export const getTriageActivity = async (item: TriageItem): Promise<TriageActivityEntry[]> => {
  const [activity, comments] = await Promise.all([
    db
      .select({
        id: triageActivity.id,
        kind: triageActivity.kind,
        actorUserId: triageActivity.actorUserId,
        actorName: user.name,
        actorImage: user.image,
        data: triageActivity.data,
        createdAt: triageActivity.createdAt,
      })
      .from(triageActivity)
      .leftJoin(user, eq(user.id, triageActivity.actorUserId))
      .where(
        and(
          eq(triageActivity.scope, item.scope),
          eq(triageActivity.itemKind, item.itemKind),
          eq(triageActivity.itemRef, item.itemRef),
          ne(triageActivity.kind, 'commented'),
        ),
      )
      .orderBy(desc(triageActivity.createdAt))
      .limit(ACTIVITY_READ_LIMIT),
    getTriageComments(item),
  ])
  return latestTimeline(
    [
      ...activity.map((entry) => ({ ...entry, body: null })),
      ...comments.map((comment) => ({
        id: comment.id,
        kind: 'commented',
        actorUserId: comment.authorUserId,
        actorName: comment.authorName,
        actorImage: comment.authorImage,
        data: null,
        body: comment.body,
        createdAt: comment.createdAt,
      })),
    ],
    ACTIVITY_READ_LIMIT,
  )
}
