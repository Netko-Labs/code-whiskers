import { parseRepositoryScope } from '../../shared'
import { getRepositoryForUser, hasInstanceAccess } from '../github'
import type { AuthorizedScope } from './types'

export const PROJECT_SCOPE_PREFIX = 'project:'

/**
 * A repository scope needs the caller to see that repository. A `project:` scope names a
 * whiskers ingest project, which has no owner yet — whoever may read /v1 may triage it.
 */
export const authorizeTriageScope = async (
  userId: string,
  scope: string,
): Promise<AuthorizedScope | null> => {
  if (scope.startsWith(PROJECT_SCOPE_PREFIX)) {
    if (scope.length <= PROJECT_SCOPE_PREFIX.length) return null
    return (await hasInstanceAccess(userId)) ? { scope, installationId: null } : null
  }
  const parsed = parseRepositoryScope(scope)
  const repo = parsed ? await getRepositoryForUser(userId, parsed) : null
  return repo ? { scope: `${repo.owner}/${repo.name}`, installationId: repo.installationId } : null
}
