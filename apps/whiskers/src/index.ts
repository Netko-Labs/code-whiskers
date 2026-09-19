import { createLogger } from '@code-whiskers/logger'
import { app } from '@code-whiskers/whiskers-api'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { runMigrations } from '@code-whiskers/whiskers-repository'

const logger = createLogger('whiskers')

/**
 * Migrating here rather than from Coolify's pre-deployment hook: that hook runs
 * inside the *previous* container, so the first deploy of a migration never
 * applies it and the new code starts against the old schema.
 */
await runMigrations()
logger.info('🗃️  migrations applied')

// The full app lives in @code-whiskers/whiskers-api; the entry just starts the Bun server.
app.listen(whiskersEnvConfig.app.port)
const url = process.env.PORTLESS_URL ?? `http://localhost:${whiskersEnvConfig.app.port}`
logger.info(`🚀 whiskers server listening on ${url}`)
