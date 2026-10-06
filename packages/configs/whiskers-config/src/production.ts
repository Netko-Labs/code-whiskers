import { isValidDsn } from '@code-whiskers/observability'
import { REVIEW_PROVIDER_CREDENTIALS } from '@code-whiskers/whiskers-domain'
import { REQUIRED_PRODUCTION_ENV } from './constants'
import { reviewProviderFrom } from './review'

/** Presence only — a credential's value is never read here. */
function reviewCredentialWarning(env: NodeJS.ProcessEnv): string | null {
  const provider = reviewProviderFrom(env)
  const names: readonly string[] = REVIEW_PROVIDER_CREDENTIALS[provider]
  if (names.some((name) => Boolean(env[name]))) return null
  return `REVIEW_PROVIDER=${provider} has no credential: set ${names.join(' or ')}; reviews will fail`
}

/**
 * Refuses to boot a production worker missing what it cannot run without. Returns warnings for
 * what is set but unusable.
 */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  if (env.NODE_ENV !== 'production') return []
  const missing = REQUIRED_PRODUCTION_ENV.filter((name) => !env[name])
  if (missing.length > 0) throw new Error(`production requires ${missing.join(', ')}`)
  const dsn = env.SENTRY_DSN
  const warnings = [reviewCredentialWarning(env)]
  if (dsn && !isValidDsn(dsn))
    warnings.push('SENTRY_DSN is ignored: expected https://<key>@<host>/<id>')
  return warnings.filter((warning): warning is string => warning !== null)
}
