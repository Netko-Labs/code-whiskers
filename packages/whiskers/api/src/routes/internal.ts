import { timingSafeEqual } from 'node:crypto'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { IssueLifecycleBodySchema } from '@code-whiskers/whiskers-domain'
import { githubAccessFor, hasGithubApp, setIssueLifecycle } from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'

/** Studio → whiskers. Not forwarded publicly, and still token-checked in case that changes. */
function authorized(header: string | null): boolean {
  const expected = whiskersEnvConfig.app.internalToken
  if (!expected) return false
  const provided = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export const internalRoutes = new Elysia({ name: 'internal', prefix: '/internal' })
  // (・ω・)ノ what a GitHub user can reach through this App
  .get('/github/access', async ({ request, query, set }) => {
    if (!authorized(request.headers.get('authorization'))) {
      set.status = 401
      return { error: 'unauthorized' }
    }
    const login = typeof query.login === 'string' ? query.login.trim() : ''
    if (!login) {
      set.status = 400
      return { error: 'login is required' }
    }
    if (!hasGithubApp()) {
      set.status = 501
      return { error: 'this worker runs without GitHub App credentials' }
    }
    return githubAccessFor(login)
  })
  // (￣ー￣)ゞ a human resolved or archived issues in studio; mirror it so ingest can act on it
  .post('/issues/lifecycle', { body: IssueLifecycleBodySchema }, async ({ request, body, set }) => {
    if (!authorized(request.headers.get('authorization'))) {
      set.status = 401
      return { error: 'unauthorized' }
    }
    return { issues: await setIssueLifecycle(body) }
  })
