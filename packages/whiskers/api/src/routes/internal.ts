import { timingSafeEqual } from 'node:crypto'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import { githubAccessFor, hasGithubApp } from '@code-whiskers/whiskers-service'
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
