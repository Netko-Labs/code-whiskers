import { createLogger } from '@code-whiskers/logger'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { Elysia } from 'elysia'
import { ingestRoutes } from './routes/ingest'
import { insightRoutes } from './routes/insights'
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
  })
  // ٩(◕‿◕)۶ health check — is the cat awake?
  .get('/health', () => ({ status: 'ok' }))
  .use(webhookRoutes)
  .use(ingestRoutes)
  .use(insightRoutes)

export type App = typeof app
