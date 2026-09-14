import { createLogger } from '@code-whiskers/logger'
import { app } from '@code-whiskers/realtime-api'
import { realtimeEnvConfig } from '@code-whiskers/realtime-config'

const logger = createLogger('realtime')

// The full app (HTTP routes + the WebSocket room) lives in @code-whiskers/realtime-api;
// the entry just starts the Bun server.
app.listen(realtimeEnvConfig.app.port)
const url = process.env.PORTLESS_URL ?? `http://localhost:${realtimeEnvConfig.app.port}`
logger.info(`🚀 realtime server listening on ${url}`)
