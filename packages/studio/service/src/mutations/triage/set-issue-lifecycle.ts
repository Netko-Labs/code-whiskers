import { createLogger } from '@code-whiskers/logger'
import {
  type IssueLifecycleRequest,
  triageActivity,
  triageState,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { authorizeTriageScope, PROJECT_SCOPE_PREFIX } from '../../queries/triage'
import { mirrorIssueLifecycle } from '../../whiskers'
import type { IssueLifecycleResult } from './types'
import { issueDecisionOf, recordedIssueIds } from './utils'

const logger = createLogger('studio-triage')

/**
 * Resolve, archive or reopen a selection of one project's issues. Whiskers takes the write first
 * and answers only the ids that are that project's, so studio records the decision for those.
 * When whiskers is unreachable the ids cannot be checked: studio records them under the
 * authorized scope alone, and the sweep's write-through is bound to the same project.
 */
export const setIssueLifecycle = async (
  userId: string,
  request: IssueLifecycleRequest,
): Promise<IssueLifecycleResult | null> => {
  const authorized = await authorizeTriageScope(userId, request.scope)
  if (!authorized?.scope.startsWith(PROJECT_SCOPE_PREFIX)) return null

  const projectId = authorized.scope.slice(PROJECT_SCOPE_PREFIX.length)
  const lifecycle = { status: request.status, resolve: request.resolve, archive: request.archive }
  const requested = [...new Set(request.issueIds)]
  const issues = await mirrorIssueLifecycle({ projectId, issueIds: requested, ...lifecycle })
  const itemRefs = recordedIssueIds(requested, issues)
  if (!issues) {
    logger.warn({ scope: authorized.scope, count: itemRefs.length }, 'issue lifecycle unmirrored')
  }
  if (itemRefs.length === 0) return { issues: [], mirrored: true }

  const decision = issueDecisionOf(lifecycle)
  const decidedAt = new Date()
  const mirroredAt = issues ? decidedAt : null
  await db.transaction(async (tx) => {
    await tx
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
          mirroredAt,
        })),
      )
      .onConflictDoUpdate({
        target: [triageState.scope, triageState.itemKind, triageState.itemRef],
        set: {
          ...decision,
          snoozedUntil: null,
          updatedBy: userId,
          updatedAt: decidedAt,
          mirroredAt,
        },
      })
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
  })
  return { issues: issues ?? [], mirrored: issues !== null }
}
