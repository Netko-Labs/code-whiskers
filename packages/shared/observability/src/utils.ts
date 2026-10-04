import { DEFAULT_RELEASE, INGEST_PATHS } from './constants'
import type { EnvRecord } from './types'

export const releaseOf = (env: EnvRecord): string =>
  env.SENTRY_RELEASE || env.SOURCE_COMMIT || DEFAULT_RELEASE

/** Staging runs with NODE_ENV=production, so it must set SENTRY_ENVIRONMENT. */
export const environmentOf = (env: EnvRecord): string =>
  env.SENTRY_ENVIRONMENT || (env.NODE_ENV === 'production' ? 'production' : 'development')

/** `http(s)://<public key>@<host>/<project id>`, the shape every Sentry SDK accepts. */
export function isValidDsn(dsn: string): boolean {
  try {
    const url = new URL(dsn)
    const isHttp = url.protocol === 'https:' || url.protocol === 'http:'
    return isHttp && url.username !== '' && /\/\d+$/.test(url.pathname)
  } catch {
    return false
  }
}

/** A malformed DSN is treated as unset: the SDK would only log and drop every event. */
export const dsnOf = (value: string | undefined): string | undefined =>
  value && isValidDsn(value) ? value : undefined

export const isIgnoredPath = (path: string, extra: readonly RegExp[] = []): boolean =>
  [...INGEST_PATHS, ...extra].some((pattern) => pattern.test(path))

/** No status means nobody decided to fail: a bug. Deliberate HTTP errors below 500 are not. */
export function isServerFault(error: unknown): boolean {
  const status = typeof error === 'object' && error !== null ? Reflect.get(error, 'status') : null
  return typeof status !== 'number' || status >= 500
}
