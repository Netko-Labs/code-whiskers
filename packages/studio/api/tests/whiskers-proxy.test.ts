import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test'

// Bun releases a served Request once the handler returns, so keep what the assertions need.
const received: {
  path: string
  cookie: string | null
  accept: string | null
  authorization?: string | null
}[] = []
const whiskers = Bun.serve({
  port: 0,
  fetch(request) {
    received.push({
      path: new URL(request.url).pathname,
      cookie: request.headers.get('cookie'),
      accept: request.headers.get('accept'),
      ...(request.headers.has('authorization') && {
        authorization: request.headers.get('authorization'),
      }),
    })
    return Response.json([{ id: 'r1' }])
  },
})

let sessionUser: { id: string } | null = null

mock.module('@code-whiskers/studio-service', () => ({
  auth: { api: { getSession: async () => (sessionUser ? { user: sessionUser } : null) } },
  verifyApiKey: async (key: string) => (key === 'cw_live' ? 'u2' : null),
  hasInstanceAccess: async (userId: string) => userId !== 'outsider',
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

const bearer = (key: string) =>
  new Request('https://whiskers.netko.dev/v1/reviews', {
    headers: { authorization: `Bearer ${key}` },
  })

describe('forwardSignedInToWhiskers', () => {
  test('a live API key is let through, and the key never reaches the worker', async () => {
    const response = await forwardSignedInToWhiskers(bearer('cw_live'))
    expect(response.status).toBe(200)
    expect(received).toHaveLength(1)
    expect(received[0]?.authorization).toBeUndefined()
  })

  test('signed in is not enough: a user outside every installation is refused', async () => {
    sessionUser = { id: 'outsider' }
    const response = await forwardSignedInToWhiskers(request())
    expect(response.status).toBe(401)
    expect(received).toHaveLength(0)
  })

  test('a key cannot write', async () => {
    const response = await forwardSignedInToWhiskers(
      new Request('https://whiskers.netko.dev/v1/projects', {
        method: 'POST',
        headers: { authorization: 'Bearer cw_live', 'content-type': 'application/json' },
        body: '{"name":"x"}',
      }),
    )
    expect(response.status).toBe(401)
    expect(received).toHaveLength(0)
  })

  test('a revoked or unknown key is refused', async () => {
    const response = await forwardSignedInToWhiskers(bearer('cw_dead'))
    expect(response.status).toBe(401)
    expect(received).toHaveLength(0)
  })

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
