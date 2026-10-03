import { createLogger } from '@code-whiskers/logger'
import { initServerTelemetry } from '@code-whiskers/observability/server'
import { studioEnvConfig } from '@code-whiskers/studio-config'
import { definePlugin } from 'nitro'
import { UNREPORTED_PATHS } from '@/integrations/observability'

/**
 * Listed first in vite.config.ts, so errors from every later plugin are seen. It registers no
 * `close` hook: hooks run in registration order, so the flush lives at the end of shutdown.ts's.
 */
export default definePlugin(() => {
  const { app, observability } = studioEnvConfig
  initServerTelemetry({ ...observability, ignoredPaths: UNREPORTED_PATHS })
  if (!app.dev && !observability.dsn) {
    createLogger('observability').warn(
      'error reporting is off: set SENTRY_DSN to report to code-whiskers',
    )
  }
})
