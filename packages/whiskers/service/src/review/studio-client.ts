import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'

const logger = createLogger('whiskers-studio')

/** A webhook must not pay a studio round trip per event. */
const TTL_MS = 60_000
const cache = new Map<string, { at: number; value: unknown; headers: Headers }>()

/**
 * Reads studio's /api/internal/*. Studio owns what humans decided; whiskers only reads it, and a
 * studio that is down or unconfigured degrades to `fallback` rather than failing the review.
 */
export async function readFromStudio<T>(
  path: string,
  params: Record<string, string>,
  fallback: T,
): Promise<{ value: T; headers: Headers }> {
  const token = whiskersEnvConfig.app.internalToken
  if (!token) return { value: fallback, headers: new Headers() }

  const url = new URL(`/api/internal/${path}`, whiskersEnvConfig.app.webBaseUrl)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const key = url.toString()
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return { value: hit.value as T, headers: hit.headers }

  try {
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) {
      logger.warn({ path, status: response.status }, 'studio lookup failed')
      return { value: fallback, headers: response.headers }
    }
    const value = (await response.json()) as T
    cache.set(key, { at: Date.now(), value, headers: response.headers })
    return { value, headers: response.headers }
  } catch (error) {
    logger.warn({ path, err: String(error) }, 'studio unreachable')
    return { value: fallback, headers: new Headers() }
  }
}
