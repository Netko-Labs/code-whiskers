import type { TriageDecisionBody } from '@code-whiskers/studio-domain'
import { authorizeTriageScope } from '../../queries/triage'
import { setTriageState } from './set-triage-state'

/**
 * Persists a decision only on a scope the user may triage — the scope is client-supplied, and
 * the reviewer trusts whatever lands under it.
 */
export const recordTriageDecision = async (
  userId: string,
  decision: TriageDecisionBody,
): Promise<boolean> => {
  const authorized = await authorizeTriageScope(userId, decision.scope)
  if (!authorized) return false

  await setTriageState({
    ...decision,
    snoozedUntil: decision.status === 'snoozed' ? decision.snoozedUntil : undefined,
    scope: authorized.scope,
    installationId: authorized.installationId,
    updatedBy: userId,
  })
  return true
}
