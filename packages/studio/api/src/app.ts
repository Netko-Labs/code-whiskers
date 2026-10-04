import { createLogger } from '@code-whiskers/logger'
import { isServerFault } from '@code-whiskers/observability'
import { reportError } from '@code-whiskers/observability/server'
import { Elysia } from 'elysia'
import { alertRoutes } from './routes/alerts'
import { githubRoutes } from './routes/github'
import { instanceRoutes } from './routes/instance'
import { integrationRoutes } from './routes/integrations'
import { internalRoutes } from './routes/internal'
import { keyRoutes } from './routes/keys'
import { memberRoutes } from './routes/members'
import { ruleRoutes } from './routes/rules'
import { savedQueryRoutes } from './routes/saved-queries'
import { sessionRoutes } from './routes/session'
import { triageRoutes } from './routes/triage'
import { forwardToWhiskers, originGuard } from './shared'

const logger = createLogger('api')

/**
 * Studio's own API is auth-only: better-auth is mounted separately at
 * `/api/auth`; this app exposes a same-origin session check. The Sentry-shaped
 * ingest paths are handed to the whiskers worker untouched.
 */
export const app = new Elysia({ prefix: '/api' })
  .error(({ path, error }) => {
    logger.error({ path, err: error instanceof Error ? error.message : String(error) }, 'API error')
    // Forwarded ingest paths are dropped in beforeSend, so a whiskers outage cannot feed itself.
    if (isServerFault(error)) reportError(error, { path, tags: { transport: 'http' } })
  })
  // (・_・ヾ writes come from our own pages
  .use(originGuard)
  // (｡•̀ᴗ-)✧ same-origin session check
  .use(sessionRoutes)
  // (ᵔᴥᵔ) installations and repositories, synced from GitHub
  .use(githubRoutes)
  // (￣ω￣) which GitHub App this instance runs
  .use(instanceRoutes)
  // (ﾉ◕ヮ◕)ﾉ teammates, for assigning and the Members section
  .use(memberRoutes)
  // (ﾟДﾟ;) alert rules
  .use(alertRoutes)
  // (っ˘ω˘ς) webhooks alerts are delivered to
  .use(integrationRoutes)
  // (￣^￣)ゞ API keys for scripts reading /v1
  .use(keyRoutes)
  // (｀・ω・´) review rules, written by humans, read by the reviewer
  .use(ruleRoutes)
  // (￣▽￣)b saved telemetry views
  .use(savedQueryRoutes)
  // ʕ·ᴥ·ʔ service-to-service: whiskers asks what humans have decided
  .use(internalRoutes)
  // (•̀ᴗ•́) resolve, approve, dismiss — durable, not just in the browser
  .use(triageRoutes)
  // (=^･ω･^=) Sentry SDKs post here; whiskers checks the DSN key
  .post('/:projectId/envelope', ({ request }) => forwardToWhiskers(request))
  .post('/:projectId/store', ({ request }) => forwardToWhiskers(request))

export type App = typeof app
