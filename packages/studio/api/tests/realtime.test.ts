import { describe, expect, mock, test } from 'bun:test'
import { studioEnvConfig } from '@code-whiskers/studio-config'

// Config is parsed once per process; another test file may have loaded it first.
studioEnvConfig.whiskers.internalToken = 'internal-test-token'

const published: string[][] = []
let sessionUser: { id: string } | null = null

const realService = await import('@code-whiskers/studio-service')
mock.module('@code-whiskers/studio-service', () => ({
  ...realService,
  realtimeBus: { publish: (topics: string[]) => published.push(topics), subscribe: () => () => {} },
  auth: {
    api: {
      getSession: async () =>
        sessionUser
          ? { user: sessionUser, session: { expiresAt: '2030-01-01T00:00:00.000Z' } }
          : null,
    },
  },
  hasInstanceAccess: async (userId: string) => userId !== 'outsider',
}))

const { internalRoutes } = await import('../src/routes/internal')
const { realtimeCallerOf } = await import('../src/shared')

const postEvents = (body: unknown, token = 'internal-test-token') =>
  internalRoutes.handle(
    new Request('http://studio.test/internal/events', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )

describe('POST /internal/events', () => {
  test('whiskers announces a change and the bus carries it', async () => {
    expect((await postEvents({ topics: ['reviews', 'issues'] })).status).toBe(200)
    expect(published.at(-1)).toEqual(['reviews', 'issues'])
  })

  test('a wrong token publishes nothing', async () => {
    const before = published.length
    expect((await postEvents({ topics: ['reviews'] }, 'nope')).status).toBe(401)
    expect(published).toHaveLength(before)
  })

  test('an unknown topic is refused', async () => {
    expect((await postEvents({ topics: ['payroll'] })).status).toBe(422)
  })
})

describe('realtimeCallerOf', () => {
  test('a member with a session may open the socket, until the session expires', async () => {
    sessionUser = { id: 'u1' }
    expect(await realtimeCallerOf(new Headers())).toEqual({
      userId: 'u1',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    })
  })

  test('no session, or no access to this instance, may not', async () => {
    sessionUser = null
    expect(await realtimeCallerOf(new Headers())).toBeNull()
    sessionUser = { id: 'outsider' }
    expect(await realtimeCallerOf(new Headers())).toBeNull()
  })
})
