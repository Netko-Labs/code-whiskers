import type { LogFilterQuery } from '@code-whiskers/whiskers-domain'
import type { LogFilter } from '@code-whiskers/whiskers-service'

const MAX_PROJECTS = 20

export function projectIdsOf(value: string | undefined): string[] | undefined {
  const ids = value
    ?.split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_PROJECTS)
  return ids?.length ? ids : undefined
}

/**
 * A project client key, as Sentry SDKs send it (`?sentry_key=`, `X-Sentry-Auth`) or as a deploy
 * script does (`Authorization: DSN <key>`).
 */
export function clientKeyFrom(
  request: Request,
  query: Record<string, string | undefined>,
): string | undefined {
  if (query.sentry_key) return query.sentry_key
  const dsn = request.headers.get('authorization')?.match(/^DSN\s+(\S+)$/i)?.[1]
  if (dsn) return dsn
  return request.headers.get('x-sentry-auth')?.match(/sentry_key=([^,\s]+)/)?.[1]
}

export function logFilterOf(query: LogFilterQuery): LogFilter {
  return {
    projectIds: projectIdsOf(query.projectId),
    service: query.service,
    levels: query.levels,
    query: query.q,
    traceId: query.traceId,
    attrs: query.attrs,
    from: query.from,
    to: query.to,
  }
}
