import { createLogger } from '@code-whiskers/logger'
import { app } from '@code-whiskers/whiskers-api'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { startAlertLoop, startRetentionLoop } from '@code-whiskers/whiskers-service'

const logger = createLogger('whiskers')

// The full app lives in @code-whiskers/whiskers-api; the entry just starts the Bun server.
app.listen(whiskersEnvConfig.app.port)
const url = process.env.PORTLESS_URL ?? `http://localhost:${whiskersEnvConfig.app.port}`
logger.info(`🚀 whiskers server listening on ${url}`)
startAlertLoop()
startRetentionLoop()
