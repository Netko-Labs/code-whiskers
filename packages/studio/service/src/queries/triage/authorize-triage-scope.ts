import { parseRepositoryScope } from '../../shared'
import { getRepositoryForUser } from '../github'
import type { AuthorizedScope } from './types'

export const PROJECT_SCOPE_PREFIX = 'project:'

/**
 * A repository scope needs the caller to see that repository. A `project:` scope names a
 * whiskers ingest project, which has no owner yet — every signed-in user already reads its
 * issues through /v1, so every signed-in user may triage them.
 */
export const authorizeTriageScope = async (
  userId: string,
  scope: string,
): Promise<AuthorizedScope | null> => {
  if (scope.startsWith(PROJECT_SCOPE_PREFIX)) {
    return scope.length > PROJECT_SCOPE_PREFIX.length ? { scope, installationId: null } : null
  }
  const parsed = parseRepositoryScope(scope)
  const repo = parsed ? await getRepositoryForUser(userId, parsed) : null
  return repo ? { scope: `${repo.owner}/${repo.name}`, installationId: repo.installationId } : null
}
