import { type TriageAssignBody, triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { getMembersForUser } from '../../queries/member'
import { authorizeTriageScope } from '../../queries/triage'

/** Only someone who shares an installation with the caller can be handed the item. */
export const assignTriageItem = async (
  userId: string,
  body: TriageAssignBody,
): Promise<boolean> => {
  const authorized = await authorizeTriageScope(userId, body.scope)
  if (!authorized) return false
  if (body.assigneeUserId !== null) {
    const members = await getMembersForUser(userId)
    if (!members.some((m) => m.id === body.assigneeUserId)) return false
  }

  await db
    .insert(triageState)
    .values({
      scope: authorized.scope,
      itemKind: body.itemKind,
      itemRef: body.itemRef,
      status: 'open',
      installationId: authorized.installationId,
      assigneeUserId: body.assigneeUserId,
      updatedBy: userId,
    })
    .onConflictDoUpdate({
      target: [triageState.scope, triageState.itemKind, triageState.itemRef],
      set: { assigneeUserId: body.assigneeUserId, updatedBy: userId, updatedAt: new Date() },
    })
  return true
}
