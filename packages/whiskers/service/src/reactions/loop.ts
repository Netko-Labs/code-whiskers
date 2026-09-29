import { createLogger } from '@code-whiskers/logger'
import { getActivePullRequests } from '../queries'
import { ACTIVE_WINDOW_MS, FIRST_SCAN_DELAY_MS, SCAN_INTERVAL_MS } from './constants'
import { scanPullRequest } from './scan'

const logger = createLogger('whiskers-reactions')
let isScanning = false

async function scanActive(): Promise<void> {
  if (isScanning) return
  isScanning = true
  try {
    const active = await getActivePullRequests(new Date(Date.now() - ACTIVE_WINDOW_MS))
    for (const ref of active) {
      await scanPullRequest(ref).catch((error) =>
        logger.warn(
          { ...ref, err: error instanceof Error ? error.message : String(error) },
          'reaction scan failed',
        ),
      )
    }
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
