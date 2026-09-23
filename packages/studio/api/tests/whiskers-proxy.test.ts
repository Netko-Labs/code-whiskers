import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test'

// Bun releases a served Request once the handler returns, so keep what the assertions need.
const received: { path: string; cookie: string | null; accept: string | null }[] = []
const whiskers = Bun.serve({
  port: 0,
  fetch(request) {
    received.push({
      path: new URL(request.url).pathname,
      cookie: request.headers.get('cookie'),
      accept: request.headers.get('accept'),
    })
    return Response.json([{ id: 'r1' }])
  },
})

let sessionUser: { id: string } | null = null

mock.module('@code-whiskers/studio-service', () => ({
  auth: { api: { getSession: async () => (sessionUser ? { user: sessionUser } : null) } },
}))
mock.module('@code-whiskers/studio-config', () => ({
  studioEnvConfig: { whiskers: { url: `http://localhost:${whiskers.port}` } },
}))

const { forwardSignedInToWhiskers } = await import('../src/shared/whiskers-proxy')

const request = () =>
  new Request('https://whiskers.netko.dev/v1/reviews', {
    headers: { cookie: 'better-auth.session_token=secret', accept: 'application/json' },
  })

beforeEach(() => {
  received.length = 0
  sessionUser = null
})
afterAll(() => whiskers.stop(true))

describe('forwardSignedInToWhiskers', () => {
  test('refuses an anonymous request without touching the worker', async () => {
    const response = await forwardSignedInToWhiskers(request())
    expect(response.status).toBe(401)
    expect(received).toHaveLength(0)
  })

  test('forwards a signed-in request and keeps the session cookie away from the worker', async () => {
    sessionUser = { id: 'u1' }
    const response = await forwardSignedInToWhiskers(request())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([{ id: 'r1' }])
    expect(received).toHaveLength(1)
    expect(received[0]).toEqual({ path: '/v1/reviews', cookie: null, accept: 'application/json' })
  })
})
