import { createLogger } from '@code-whiskers/logger'
import { Elysia } from 'elysia'
import { githubRoutes } from './routes/github'
import { internalRoutes } from './routes/internal'
import { sessionRoutes } from './routes/session'
import { triageRoutes } from './routes/triage'
import { forwardToWhiskers } from './shared'

const logger = createLogger('api')

/**
 * Studio's own API is auth-only: better-auth is mounted separately at
 * `/api/auth`; this app exposes a same-origin session check. The Sentry-shaped
 * ingest paths are handed to the whiskers worker untouched.
 */
export const app = new Elysia({ prefix: '/api' })
  .error(({ path, error }) => {
    logger.error({ path, err: error instanceof Error ? error.message : String(error) }, 'API error')
  })
  // ٩(◕‿◕)۶ health check — is studio awake?
  .get('/health', () => ({ status: 'ok' }))
  // (｡•̀ᴗ-)✧ same-origin session check
  .use(sessionRoutes)
  // (ᵔᴥᵔ) installations and repositories, synced from GitHub
  .use(githubRoutes)
  // ʕ·ᴥ·ʔ service-to-service: whiskers asks what humans have decided
  .use(internalRoutes)
  // (•̀ᴗ•́) resolve, approve, dismiss — durable, not just in the browser
  .use(triageRoutes)
  // (=^･ω･^=) Sentry SDKs post here; whiskers checks the DSN key
  .post('/:projectId/envelope', ({ request }) => forwardToWhiskers(request))
  .post('/:projectId/store', ({ request }) => forwardToWhiskers(request))

export type App = typeof app
