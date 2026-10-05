import { type IssueTransitionBody, triageActivity, triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { PROJECT_SCOPE_PREFIX } from '../../queries/triage'

const REOPENED = {
  status: 'open',
  resolveMode: null,
  archiveMode: null,
  archiveValue: null,
  snoozedUntil: null,
  updatedBy: null,
} as const

/**
 * Whiskers reopened an issue at ingest: a regression after a resolve, or an archive whose
 * condition ran out. The decision is already whiskers' state, so it lands mirrored.
 */
export const recordIssueTransition = async (body: IssueTransitionBody): Promise<void> => {
  const scope = `${PROJECT_SCOPE_PREFIX}${body.projectId}`
  const now = new Date()
  await db.transaction(async (tx) => {
    await tx
      .insert(triageState)
      .values({
        scope,
        itemKind: 'issue',
        itemRef: body.issueId,
        ...REOPENED,
        updatedAt: now,
        mirroredAt: now,
      })
      .onConflictDoUpdate({
        target: [triageState.scope, triageState.itemKind, triageState.itemRef],
        set: { ...REOPENED, updatedAt: now, mirroredAt: now },
      })
    await tx.insert(triageActivity).values({
      scope,
      itemKind: 'issue',
      itemRef: body.issueId,
      kind: body.kind,
      actorUserId: null,
      data: { eventId: body.eventId ?? null, release: body.release ?? null },
    })
  })
}
