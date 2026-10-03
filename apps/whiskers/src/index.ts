import { createLogger } from '@code-whiskers/logger'
import { app } from '@code-whiskers/whiskers-api'
import { assertProductionEnv, whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { closeDb } from '@code-whiskers/whiskers-repository'
import {
  failStaleReviews,
  startAlertLoop,
  startReactionLoop,
  startRetentionLoop,
} from '@code-whiskers/whiskers-service'

const logger = createLogger('whiskers')

assertProductionEnv()
// The full app lives in @code-whiskers/whiskers-api; the entry just starts the Bun server.
app.listen(whiskersEnvConfig.app.port)
const url = process.env.PORTLESS_URL ?? `http://localhost:${whiskersEnvConfig.app.port}`
logger.info(`🚀 whiskers server listening on ${url}`)
startAlertLoop()
startRetentionLoop()
startReactionLoop()
failStaleReviews()
  .then((count) => count > 0 && logger.info({ count }, 'stale reviews marked failed'))
  .catch((error: Error) => logger.warn({ err: error.message }, 'stale review sweep failed'))

// A review cut off here is marked failed by the next boot's stale sweep.
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'shutting down')
  await app.stop()
  await closeDb()
  process.exit(0)
}
process.once('SIGTERM', () => void shutdown('SIGTERM'))
process.once('SIGINT', () => void shutdown('SIGINT'))
