import { type TriageAssignBody, triageActivity, triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { getMembersForUser } from '../../queries/member'
import { authorizeTriageScope } from '../../queries/triage'

/** Only someone who shares an installation with the caller can be handed the items. */
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

  const itemRefs = [...new Set([...(body.itemRefs ?? []), ...(body.itemRef ? [body.itemRef] : [])])]
  const item = (itemRef: string) => ({
    scope: authorized.scope,
    itemKind: body.itemKind,
    itemRef,
  })
  await db.transaction(async (tx) => {
    await tx
      .insert(triageState)
      .values(
        itemRefs.map((itemRef) => ({
          ...item(itemRef),
          status: 'open' as const,
          installationId: authorized.installationId,
          assigneeUserId: body.assigneeUserId,
          updatedBy: userId,
        })),
      )
      .onConflictDoUpdate({
        target: [triageState.scope, triageState.itemKind, triageState.itemRef],
        set: { assigneeUserId: body.assigneeUserId, updatedBy: userId, updatedAt: new Date() },
      })
    await tx.insert(triageActivity).values(
      itemRefs.map((itemRef) => ({
        ...item(itemRef),
        kind: 'assigned' as const,
        actorUserId: userId,
        data: { assigneeUserId: body.assigneeUserId },
      })),
    )
  })
  return true
}
