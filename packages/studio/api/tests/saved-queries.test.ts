import { beforeEach, describe, expect, mock, test } from 'bun:test'

const QUERY_ID = '0b9d2b64-5b53-4a3f-9d3c-2a4f2f0e6a11'
const renames: { userId: string; id: string; name: string }[] = []
const created: unknown[] = []
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
  createSavedQuery: async (_userId: string, input: unknown) => {
    created.push(input)
    return { id: QUERY_ID }
  },
  renameSavedQuery: async (userId: string, id: string, input: { name: string }) => {
    if (userId !== 'owner') return false
    renames.push({ userId, id, name: input.name })
    return true
  },
}))

const { savedQueryRoutes } = await import('../src/routes/saved-queries')

const send = (method: string, path: string, body?: unknown) =>
  savedQueryRoutes.handle(
    new Request(`http://studio.test/saved-queries${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  )

describe('saved queries', () => {
  beforeEach(() => {
    renames.length = 0
    created.length = 0
    sessionUser = { id: 'owner' }
  })

  test('renaming needs a session', async () => {
    sessionUser = null
    const response = await send('PATCH', `/${QUERY_ID}`, { name: 'Checkout errors' })
    expect(response.status).toBe(401)
    expect(renames).toHaveLength(0)
  })

  test("someone else's view is not found, not renamed", async () => {
    sessionUser = { id: 'stranger' }
    const response = await send('PATCH', `/${QUERY_ID}`, { name: 'Mine now' })
    expect(response.status).toBe(404)
  })

  test('the owner renames with a trimmed name; a blank one is refused', async () => {
    expect((await send('PATCH', `/${QUERY_ID}`, { name: '  Slow checkout  ' })).status).toBe(200)
    expect(renames).toEqual([{ userId: 'owner', id: QUERY_ID, name: 'Slow checkout' }])
    expect((await send('PATCH', `/${QUERY_ID}`, { name: '   ' })).status).toBe(422)
  })

  test('the explorer search is stored as params; an oversized one is refused', async () => {
    const params = { levels: ['error'], attrs: { 'http.route': '/pay' }, range: '1h' }
    const ok = await send('POST', '', { name: 'Pay errors', section: 'live-logs', params })
    expect(ok.status).toBe(200)
    expect(created[0]).toMatchObject({ section: 'live-logs', params })
    const huge = await send('POST', '', {
      name: 'Too much',
      section: 'live-logs',
      params: { q: 'x'.repeat(5_000) },
    })
    expect(huge.status).toBe(422)
  })
})
