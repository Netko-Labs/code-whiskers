import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'

const logger = createLogger('whiskers-suppressions')

export interface Suppression {
  itemKind: string
  itemRef: string
  status: string
  note: string | null
}

/** A webhook must not pay a studio round trip per event. */
const TTL_MS = 60_000
const cache = new Map<string, { at: number; value: Suppression[] }>()

/**
 * What humans have already dismissed, resolved or snoozed on this repo, so the
 * reviewer stops re-raising it. Studio owns these decisions; whiskers only reads
 * them, and a studio that is down or unconfigured degrades to "nothing
 * suppressed" rather than failing the review.
 */
export async function fetchSuppressions(scope: string): Promise<Suppression[]> {
  const token = whiskersEnvConfig.app.internalToken
  if (!token) return []

  const hit = cache.get(scope)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value

  try {
    const url = new URL('/api/internal/suppressions', whiskersEnvConfig.app.webBaseUrl)
    url.searchParams.set('scope', scope)
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) {
      logger.warn({ scope, status: response.status }, 'suppressions lookup failed')
      return []
    }
    const value = (await response.json()) as Suppression[]
    if (response.headers.get('x-suppressions-truncated') === 'true') {
      logger.warn({ scope, kept: value.length }, 'suppressions truncated; oldest decisions dropped')
    }
    cache.set(scope, { at: Date.now(), value })
    return value
  } catch (error) {
    logger.warn({ scope, err: String(error) }, 'suppressions unreachable')
    return []
  }
}
