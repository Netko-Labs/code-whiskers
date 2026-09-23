import type { RepositoryScope } from './types'

/** A triage scope is `owner/name`; anything else names no repository. */
export const parseRepositoryScope = (scope: string): RepositoryScope | null => {
  const [owner, name, ...rest] = scope.split('/')
  if (!owner || !name || rest.length > 0) return null
  return { owner, name }
}
