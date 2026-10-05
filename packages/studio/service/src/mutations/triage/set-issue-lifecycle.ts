import { createLogger } from '@code-whiskers/logger'
import {
  type IssueLifecycleRequest,
  triageActivity,
  triageState,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { authorizeTriageScope } from '../../queries/triage'
import { mirrorIssueLifecycle } from '../../whiskers'
import { markMirrored } from './mark-mirrored'
import type { IssueLifecycleResult } from './types'
import { issueDecisionOf } from './utils'

const logger = createLogger('studio-triage')

/**
 * Resolve, archive or reopen a selection of issues. Studio records the decision and its activity
 * first, then writes it through to whiskers; a failed write-through leaves the decision unmirrored
 * for the sweep instead of undoing it.
 */
export const setIssueLifecycle = async (
  userId: string,
  request: IssueLifecycleRequest,
): Promise<IssueLifecycleResult | null> => {
  const authorized = await authorizeTriageScope(userId, request.scope)
  if (!authorized) return null

  const lifecycle = { status: request.status, resolve: request.resolve, archive: request.archive }
  const itemRefs = [...new Set(request.issueIds)]
  const decision = issueDecisionOf(lifecycle)
  const decidedAt = new Date()
  const written = await db.transaction(async (tx) => {
    const rows = await tx
      .insert(triageState)
      .values(
        itemRefs.map((itemRef) => ({
          scope: authorized.scope,
          itemKind: 'issue' as const,
          itemRef,
          installationId: authorized.installationId,
          ...decision,
          updatedBy: userId,
          updatedAt: decidedAt,
        })),
      )
      .onConflictDoUpdate({
        target: [triageState.scope, triageState.itemKind, triageState.itemRef],
        set: {
          ...decision,
          snoozedUntil: null,
          updatedBy: userId,
          updatedAt: decidedAt,
          mirroredAt: null,
        },
      })
      .returning({ id: triageState.id })
    await tx.insert(triageActivity).values(
      itemRefs.map((itemRef) => ({
        scope: authorized.scope,
        itemKind: 'issue' as const,
        itemRef,
        kind: lifecycle.status,
        actorUserId: userId,
        data: { ...lifecycle.resolve, ...lifecycle.archive },
      })),
    )
    return rows
  })

  const issues = await mirrorIssueLifecycle({ issueIds: itemRefs, ...lifecycle })
  if (issues) {
    await markMirrored(
      written.map((row) => row.id),
      decidedAt,
    )
  } else {
    logger.warn({ scope: authorized.scope, count: itemRefs.length }, 'issue lifecycle unmirrored')
  }
  return { issues: issues ?? [], mirrored: issues !== null }
}
