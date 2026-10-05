import { createLogger } from '@code-whiskers/logger'
import { isServerFault } from '@code-whiskers/observability'
import { reportError } from '@code-whiskers/observability/server'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { pingDatabase } from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'
import { deployRoutes } from './routes/deploys'
import { ingestRoutes } from './routes/ingest'
import { insightRoutes } from './routes/insights'
import { internalRoutes } from './routes/internal'
import { issueRoutes } from './routes/issues'
import { otlpRoutes } from './routes/otlp'
import { projectRoutes } from './routes/projects'
import { releaseRoutes } from './routes/releases'
import { telemetryRoutes } from './routes/telemetry'
import { webhookRoutes } from './routes/webhooks'

const logger = createLogger('whiskers-api')
const allowedOrigins = whiskersEnvConfig.app.cors

/**
 * The 360 tool's whole surface: GitHub webhooks -> AI review, Sentry-compatible
 * ingest, and read-only insights. `export type App` feeds Eden Treaty clients;
 * the app entry (apps/whiskers) just `.listen()`s it.
 *
 * CORS is hand-rolled because `@elysiajs/cors` has no Elysia 2 build yet.
 */
export const app = new Elysia()
  .request(({ set, request }) => {
    const origin = request.headers.get('origin')
    if (origin && allowedOrigins.includes(origin)) {
      set.headers['access-control-allow-origin'] = origin
      set.headers['access-control-allow-credentials'] = 'true'
      set.headers['access-control-allow-methods'] = 'GET, POST, PATCH, DELETE, OPTIONS'
      set.headers['access-control-allow-headers'] = 'content-type, authorization, x-sentry-auth'
    }
  })
  // (づ｡◕‿‿◕｡)づ CORS preflight — wave the browser through
  .options('/*', ({ set }) => {
    set.status = 204
    return ''
  })
  .error(({ path, error }) => {
    logger.error(
      { path, err: error instanceof Error ? error.message : String(error) },
      'whiskers error',
    )
    // Ingest paths are dropped in beforeSend: whiskers is the sink it would report to.
    if (isServerFault(error)) reportError(error, { path, tags: { transport: 'http' } })
  })
  // ٩(◕‿◕)۶ health check — is the cat awake? Coolify reads the status code.
  .get('/health', async ({ set }) => {
    const isHealthy = await pingDatabase()
    set.status = isHealthy ? 200 : 503
    const { release, environment } = whiskersEnvConfig.observability
    return {
      status: isHealthy ? 'ok' : 'degraded',
      release,
      environment,
      checks: { database: isHealthy },
    }
  })
  .use(webhookRoutes)
  .use(ingestRoutes)
  .use(deployRoutes)
  .use(insightRoutes)
  .use(releaseRoutes)
  .use(telemetryRoutes)
  .use(projectRoutes)
  .use(issueRoutes)
  .use(otlpRoutes)
  .use(internalRoutes)

export type App = typeof app
