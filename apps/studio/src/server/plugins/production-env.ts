import { createLogger } from '@code-whiskers/logger'
import { assertProductionEnv } from '@code-whiskers/studio-config'
import { definePlugin } from 'nitro'

// A plugin, not module scope: the build runs with NODE_ENV=production and no secrets.
export default definePlugin(() => {
  const logger = createLogger('studio')
  for (const warning of assertProductionEnv()) logger.warn(warning)
})
