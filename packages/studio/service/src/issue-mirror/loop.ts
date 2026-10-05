import { createLogger } from '@code-whiskers/logger'
import { studioEnvConfig } from '@code-whiskers/studio-config'
import { reconcileIssueMirror } from '../mutations'
import { MIRROR_FIRST_SWEEP_MS, MIRROR_SWEEP_INTERVAL_MS } from './constants'

const logger = createLogger('studio-issue-mirror')

/**
 * Keeps whiskers' issue mirror in step with studio's decisions, never two passes at once. Returns
 * a stop function. Without an internal token there is no one to tell.
 */
export function startIssueMirrorSweep(): () => void {
  if (!studioEnvConfig.whiskers.internalToken) return () => undefined
  let isRunning = false
  const sweep = async () => {
    if (isRunning) return
    isRunning = true
    try {
      const settled = await reconcileIssueMirror()
      if (settled > 0) logger.info({ settled }, 'issue decisions mirrored to whiskers')
    } catch (error) {
      logger.warn({ err: String(error) }, 'issue mirror sweep failed')
    } finally {
      isRunning = false
    }
  }
  const first = setTimeout(() => void sweep(), MIRROR_FIRST_SWEEP_MS)
  const every = setInterval(() => void sweep(), MIRROR_SWEEP_INTERVAL_MS)
  first.unref()
  every.unref()
  return () => {
    clearTimeout(first)
    clearInterval(every)
  }
}
