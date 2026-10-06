import { createLogger } from '@code-whiskers/logger'
import {
  initServerTelemetry,
  reportError,
  shutdownTelemetry,
} from '@code-whiskers/observability/server'
import { app } from '@code-whiskers/whiskers-api'
import { assertProductionEnv, whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { closeDb } from '@code-whiskers/whiskers-repository'
import {
  failStaleReviews,
  reviewProvider,
  startAlertLoop,
  startReactionLoop,
  startRetentionLoop,
} from '@code-whiskers/whiskers-service'

const logger = createLogger('whiskers')

for (const warning of assertProductionEnv()) logger.warn(warning)
const { app: appConfig, observability } = whiskersEnvConfig
initServerTelemetry(observability)
if (!appConfig.dev && !observability.dsn) {
  logger.warn('error reporting is off: set SENTRY_DSN to report to code-whiskers')
}
// The full app lives in @code-whiskers/whiskers-api; the entry just starts the Bun server.
app.listen(appConfig.port)
const url = process.env.PORTLESS_URL ?? `http://localhost:${appConfig.port}`
logger.info(`🚀 whiskers server listening on ${url}`)
reviewProvider()
  .status()
  .then(({ provider, problems }) => {
    for (const problem of problems) logger.warn({ provider }, `reviewer: ${problem}`)
  })
  .catch((error: Error) => logger.warn({ err: error.message }, 'reviewer status unavailable'))
startAlertLoop()
startRetentionLoop()
startReactionLoop()
failStaleReviews()
  .then((count) => count > 0 && logger.info({ count }, 'stale reviews marked failed'))
  .catch((error: Error) => {
    logger.warn({ err: error.message }, 'stale review sweep failed')
    reportError(error, { tags: { task: 'stale-review-sweep' } })
  })

// A review cut off here is marked failed by the next boot's stale sweep.
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'shutting down')
  await app.stop()
  await closeDb()
  await shutdownTelemetry()
  process.exit(0)
}
process.once('SIGTERM', () => void shutdown('SIGTERM'))
process.once('SIGINT', () => void shutdown('SIGINT'))
