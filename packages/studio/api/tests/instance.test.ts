import { beforeEach, describe, expect, mock, test } from 'bun:test'

const renames: { userId: string; name: string }[] = []
let sessionUser: { id: string } | null = null

// Bun keeps a module mock for the rest of the process: spread the real module so later test
// files importing it still find every export.
const realService = await import('@code-whiskers/studio-service')
mock.module('@code-whiskers/studio-service', () => ({
  ...realService,
  auth: {
    api: {
      getSession: async () =>
        sessionUser
          ? { user: sessionUser, session: { expiresAt: '2030-01-01T00:00:00.000Z' } }
          : null,
    },
  },
  getInstanceSettings: async () => ({ name: 'CodeWhiskers', updatedAt: null }),
  hasInstanceAccess: async (userId: string) => userId !== 'stranger',
  updateInstanceSettings: async (userId: string, input: { name: string }) => {
    renames.push({ userId, name: input.name })
    return { name: input.name, updatedAt: new Date('2026-10-05T00:00:00Z') }
  },
  probeWhiskers: async () => ({
    status: 'unreachable',
    latencyMs: null,
    checkedAt: new Date('2026-10-05T00:00:00Z'),
    release: null,
  }),
}))

const { instanceRoutes } = await import('../src/routes/instance')

const request = (method: string, path = '', body?: unknown) =>
  instanceRoutes.handle(
    new Request(`http://studio.test/instance${path}`, {
      method,
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    }),
  )

beforeEach(() => {
  renames.length = 0
  sessionUser = { id: 'u1' }
})

describe('GET /instance', () => {
  test('needs a session', async () => {
    sessionUser = null
    expect((await request('GET')).status).toBe(401)
  })

  test('answers the name with the env-driven values beside it', async () => {
    const body = await (await request('GET')).json()
    expect(body.name).toBe('CodeWhiskers')
    expect(typeof body.baseUrl).toBe('string')
    expect(body.githubApp.installUrl).toContain('/installations/new')
  })
})

describe('PATCH /instance', () => {
  test('needs a session', async () => {
    sessionUser = null
    expect((await request('PATCH', '', { name: 'Netko' })).status).toBe(401)
    expect(renames).toEqual([])
  })

  test('refuses someone without access to the instance', async () => {
    sessionUser = { id: 'stranger' }
    expect((await request('PATCH', '', { name: 'Netko' })).status).toBe(403)
    expect(renames).toEqual([])
  })

  test('validates with the domain schema before saving', async () => {
    expect((await request('PATCH', '', { name: '   ' })).status).toBe(422)
    expect((await request('PATCH', '', { name: 'x'.repeat(61) })).status).toBe(422)
    expect(renames).toEqual([])
  })

  test('saves the trimmed name as the caller', async () => {
    const response = await request('PATCH', '', { name: '  Netko  ' })
    expect(response.status).toBe(200)
    expect(renames).toEqual([{ userId: 'u1', name: 'Netko' }])
    expect((await response.json()).name).toBe('Netko')
  })
})

describe('GET /instance/health', () => {
  test('passes the worker probe through, session required', async () => {
    expect((await (await request('GET', '/health')).json()).status).toBe('unreachable')
    sessionUser = null
    expect((await request('GET', '/health')).status).toBe(401)
  })
})
