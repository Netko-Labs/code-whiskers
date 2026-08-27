import { createLogger } from '@code-whiskers/logger'
import { app } from '@code-whiskers/whiskers-api'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'

const logger = createLogger('whiskers')

// The full app (HTTP routes + the WebSocket room) lives in @code-whiskers/whiskers-api;
// the entry just starts the Bun server.
const port = whiskersEnvConfig.app.port
app.listen(port)
logger.info(`🚀 whiskers server listening on http://localhost:${port}`)
