import { createLogger } from '@code-whiskers/logger'
import { PROBE_TIMEOUT_MS } from './constants'
import type { ProbeStatus } from './types'

const logger = createLogger('health')

/** Silent on success — Coolify probes every few seconds. */
export async function probe(check: string, work: Promise<unknown>): Promise<ProbeStatus> {
  const startTime = Date.now()
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), PROBE_TIMEOUT_MS)
  })
  try {
    await Promise.race([work, timeout])
    return 'connected'
  } catch (error) {
    logger.warn(
      {
        check,
        err: error instanceof Error ? error.message : String(error),
        elapsed: Date.now() - startTime,
      },
      'health probe failed',
    )
    return 'unavailable'
  } finally {
    clearTimeout(timer)
  }
}
