import { createLogger } from '@code-whiskers/logger'
import { reportError } from '@code-whiskers/observability/server'
import { getActivePullRequests } from '../queries'
import { ACTIVE_WINDOW_MS, FIRST_SCAN_DELAY_MS, SCAN_INTERVAL_MS } from './constants'
import { scanPullRequest } from './scan'

const logger = createLogger('whiskers-reactions')
let isScanning = false

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function scanActive(): Promise<void> {
  if (isScanning) return
  isScanning = true
  try {
    const active = await getActivePullRequests(new Date(Date.now() - ACTIVE_WINDOW_MS))
    for (const ref of active) {
      await scanPullRequest(ref).catch((error) => {
        logger.warn({ ...ref, err: messageOf(error) }, 'reaction scan failed')
        reportError(error, { tags: { task: 'reactions' } })
      })
    }
  } catch (error) {
    // The timers discard this promise; a database blip must be logged, never crash the worker.
    logger.warn({ err: messageOf(error) }, 'reaction scan could not list pull requests')
    reportError(error, { tags: { task: 'reactions' } })
  } finally {
    isScanning = false
  }
}

/** Reactions on the reviewer's comments are commands; GitHub never pushes them, so poll. */
export function startReactionLoop(): void {
  setTimeout(() => {
    void scanActive()
    setInterval(() => void scanActive(), SCAN_INTERVAL_MS)
  }, FIRST_SCAN_DELAY_MS)
}
