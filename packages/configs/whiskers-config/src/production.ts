import { isValidDsn } from '@code-whiskers/observability'
import { REQUIRED_PRODUCTION_ENV } from './constants'

/**
 * Refuses to boot a production worker missing what it cannot run without. Returns warnings for
 * what is set but unusable.
 */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  if (env.NODE_ENV !== 'production') return []
  const missing = REQUIRED_PRODUCTION_ENV.filter((name) => !env[name])
  if (missing.length > 0) throw new Error(`production requires ${missing.join(', ')}`)
  const dsn = env.SENTRY_DSN
  return dsn && !isValidDsn(dsn)
    ? ['SENTRY_DSN is ignored: expected https://<key>@<host>/<id>']
    : []
}
