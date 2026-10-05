import { studioEnvConfig } from '@code-whiskers/studio-config'
import { WhiskersHealthBodySchema } from '@code-whiskers/studio-domain'
import { WHISKERS_HEALTH_TIMEOUT_MS } from './constants'
import type { WhiskersHealth } from './types'

/** One round trip to the worker's `/health`; a timeout or garbage both read as unreachable. */
export async function probeWhiskers(): Promise<WhiskersHealth> {
  const started = performance.now()
  const checkedAt = new Date()
  try {
    const response = await fetch(new URL('/health', studioEnvConfig.whiskers.url), {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(WHISKERS_HEALTH_TIMEOUT_MS),
    })
    const latencyMs = Math.round(performance.now() - started)
    const body = WhiskersHealthBodySchema.safeParse(await response.json().catch(() => null))
    if (!body.success) return { status: 'unreachable', latencyMs, checkedAt, release: null }
    return {
      status: response.ok && body.data.status === 'ok' ? 'ok' : 'degraded',
      latencyMs,
      checkedAt,
      release: body.data.release ?? null,
    }
  } catch {
    return { status: 'unreachable', latencyMs: null, checkedAt, release: null }
  }
}
