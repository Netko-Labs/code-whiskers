import { type TriageItem, triageComment, user } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, asc, eq } from 'drizzle-orm'
import type { TriageCommentRecord } from './types'

const COMMENT_READ_LIMIT = 200

export const getTriageComments = async (item: TriageItem): Promise<TriageCommentRecord[]> => {
  return await db
    .select({
      id: triageComment.id,
      body: triageComment.body,
      createdAt: triageComment.createdAt,
      authorUserId: triageComment.authorUserId,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(triageComment)
    .leftJoin(user, eq(user.id, triageComment.authorUserId))
    .where(
      and(
        eq(triageComment.scope, item.scope),
        eq(triageComment.itemKind, item.itemKind),
        eq(triageComment.itemRef, item.itemRef),
      ),
    )
    .orderBy(asc(triageComment.createdAt))
    .limit(COMMENT_READ_LIMIT)
}
