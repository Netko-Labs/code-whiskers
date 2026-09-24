import { createLogger } from '@code-whiskers/logger'
import { RETENTION_INTERVAL_MS } from './constants'
import { expireTelemetry } from './ingest'

const logger = createLogger('whiskers-retention')

export function startRetentionLoop(): void {
  const run = () =>
    expireTelemetry()
      .then((removed) => {
        if (removed.logs || removed.spans || removed.events)
          logger.info(removed, 'expired telemetry')
      })
      .catch((error) => logger.warn({ err: String(error) }, 'retention pass failed'))
  void run()
  setInterval(() => void run(), RETENTION_INTERVAL_MS)
}
