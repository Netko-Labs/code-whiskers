import { isValidDsn } from '@code-whiskers/observability'
import {
  DSN_ENV,
  MIN_AUTH_SECRET_DISTINCT_CHARS,
  MIN_AUTH_SECRET_LENGTH,
  REQUIRED_PRODUCTION_ENV,
} from './constants'

/**
 * Refuses to boot a production server missing what it cannot run without. Returns warnings for
 * what is merely weak, so an existing deploy is never bricked by a stricter rule.
 */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  if (env.NODE_ENV !== 'production') return []
  const missing = REQUIRED_PRODUCTION_ENV.filter((name) => !env[name])
  if (missing.length > 0) throw new Error(`production requires ${missing.join(', ')}`)
  const secret = env.AUTH_SECRET ?? ''
  const isWeak =
    secret.length < MIN_AUTH_SECRET_LENGTH || new Set(secret).size < MIN_AUTH_SECRET_DISTINCT_CHARS
  const warnings = isWeak ? ['AUTH_SECRET is weak: generate one with openssl rand -base64 32'] : []
  for (const name of DSN_ENV) {
    const dsn = env[name]
    if (dsn && !isValidDsn(dsn))
      warnings.push(`${name} is ignored: expected https://<key>@<host>/<id>`)
  }
  return warnings
}
