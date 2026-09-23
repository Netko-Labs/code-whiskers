import { type TriageCommentBody, triageComment } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { authorizeTriageScope } from '../../queries/triage'

export const addTriageComment = async (
  userId: string,
  body: TriageCommentBody,
): Promise<{ id: string } | null> => {
  const authorized = await authorizeTriageScope(userId, body.scope)
  if (!authorized) return null

  const [row] = await db
    .insert(triageComment)
    .values({
      scope: authorized.scope,
      itemKind: body.itemKind,
      itemRef: body.itemRef,
      authorUserId: userId,
      body: body.body,
    })
    .returning({ id: triageComment.id })
  return row ?? null
}
