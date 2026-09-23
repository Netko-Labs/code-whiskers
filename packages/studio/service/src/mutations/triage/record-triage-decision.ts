import { getRepositoryForUser } from '../../queries/github'
import { parseRepositoryScope } from '../../shared'
import { setTriageState } from './set-triage-state'
import type { TriageDecision } from './types'

/**
 * Persists a decision only on a repository the user can see — the scope is
 * client-supplied, and the reviewer trusts whatever lands under it.
 */
export const recordTriageDecision = async (
  userId: string,
  decision: TriageDecision,
): Promise<boolean> => {
  const scope = parseRepositoryScope(decision.scope)
  const repo = scope ? await getRepositoryForUser(userId, scope) : null
  if (!repo) return false

  await setTriageState({
    ...decision,
    scope: `${repo.owner}/${repo.name}`,
    installationId: repo.installationId,
    updatedBy: userId,
  })
  return true
}
