import { type TriageCommentBody, triageActivity, triageComment } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { authorizeTriageScope } from '../../queries/triage'

export const addTriageComment = async (
  userId: string,
  body: TriageCommentBody,
): Promise<{ id: string } | null> => {
  const authorized = await authorizeTriageScope(userId, body.scope)
  if (!authorized) return null

  const item = { scope: authorized.scope, itemKind: body.itemKind, itemRef: body.itemRef }
  return await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(triageComment)
      .values({ ...item, authorUserId: userId, body: body.body })
      .returning({ id: triageComment.id })
    if (!row) return null
    await tx.insert(triageActivity).values({
      ...item,
      kind: 'commented',
      actorUserId: userId,
      data: { commentId: row.id },
    })
    return row
  })
}
