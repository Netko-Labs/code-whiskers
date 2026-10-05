import type { WhiskersProject, WhiskersProjectKey } from '@/integrations/whiskers'
import type { DsnParts } from '../types'

/** Sentry's DSN shape: the public key as the username, the project id as the path. */
export function dsnFor(origin: string, projectId: string, publicKey: string): string {
  const url = new URL(origin)
  return `${url.protocol}//${publicKey}@${url.host}/${projectId}`
}

export function dsnPartsOf(dsn: string): DsnParts {
  const url = new URL(dsn)
  return {
    origin: `${url.protocol}//${url.host}`,
    publicKey: decodeURIComponent(url.username),
    projectId: url.pathname.replace(/^\//, ''),
  }
}

/** The oldest enabled key: what setup shows and "Copy DSN" copies. */
export function primaryKeyOf(project: WhiskersProject): WhiskersProjectKey | undefined {
  return project.keys.find((key) => key.isEnabled)
}

export function projectDsn(origin: string, project: WhiskersProject): string | null {
  const key = primaryKeyOf(project)
  return key ? dsnFor(origin, project.id, key.publicKey) : null
}

/** Studio fronts ingest, so the DSN host is the console's own origin. */
export function consoleOrigin(): string {
  return typeof window === 'undefined' ? 'https://example.com' : window.location.origin
}

const NO_REPOSITORY = ''

export function repositoryOptionsOf(repos: { owner: string; name: string }[]) {
  return [
    { value: NO_REPOSITORY, label: 'No repository' },
    ...repos
      .map((repo) => `${repo.owner}/${repo.name}`)
      .sort((a, b) => a.localeCompare(b))
      .map((slug) => ({ value: slug, label: slug })),
  ]
}
