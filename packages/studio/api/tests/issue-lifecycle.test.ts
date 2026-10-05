import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { studioEnvConfig } from '@code-whiskers/studio-config'

// Config is parsed once per process; another test file may have loaded it first.
studioEnvConfig.whiskers.internalToken = 'internal-test-token'

const ISSUE_ID = '6762076c-880a-40ba-ac33-2830f16207d5'
const published: string[][] = []
const transitions: unknown[] = []
const lifecycles: unknown[] = []
const recentReads: { userId: string; limit: number }[] = []
const alerted: unknown[] = []
let sessionUser: { id: string } | null = null

// Bun keeps a module mock for the rest of the process: spread the real module so later test
// files importing it still find every export.
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
  recordIssueTransition: async (body: unknown) => {
    transitions.push(body)
  },
  alertOnIssueTransition: async (body: unknown) => {
    alerted.push(body)
    return 0
  },
  setIssueLifecycle: async (userId: string, body: unknown) => {
    if (userId === 'outsider') return null
    lifecycles.push(body)
    return { issues: [], mirrored: false }
  },
  authorizeTriageScope: async (userId: string, scope: string) =>
    userId === 'outsider' ? null : { scope, installationId: null },
  getTriageActivity: async () => [],
  getRecentTriageActivity: async (userId: string, limit: number) => {
    recentReads.push({ userId, limit })
    return []
  },
}))

const { internalRoutes } = await import('../src/routes/internal')
const { triageRoutes } = await import('../src/routes/triage')

const transition = { issueId: ISSUE_ID, projectId: 'p1', kind: 'regressed', eventId: 'e1' }

const postTransition = (body: unknown, token?: string) =>
  internalRoutes.handle(
    new Request('http://studio.test/internal/issues/transition', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token && { authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    }),
  )

const postLifecycle = (body: unknown) =>
  triageRoutes.handle(
    new Request('http://studio.test/triage/issues/lifecycle', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )

beforeEach(() => {
  sessionUser = null
})

describe('POST /internal/issues/transition', () => {
  test('whiskers reopens an issue: studio records it and open consoles refetch', async () => {
    const before = published.length
    expect((await postTransition(transition, 'internal-test-token')).status).toBe(200)
    expect(transitions.at(-1)).toEqual(transition)
    expect(published.slice(before)).toEqual([['issues']])
  })

  test('a regression is handed to the alert rules without waiting on delivery', async () => {
    const before = alerted.length
    expect((await postTransition(transition, 'internal-test-token')).status).toBe(200)
    expect(alerted.slice(before)).toEqual([transition])
  })

  test('no token, or the wrong one, records nothing', async () => {
    const before = transitions.length
    expect((await postTransition(transition)).status).toBe(401)
    expect((await postTransition(transition, 'internal-test-tokeX')).status).toBe(401)
    expect(transitions).toHaveLength(before)
  })

  test('only a regression or an ended archive is a transition', async () => {
    const body = { ...transition, kind: 'resolved' }
    expect((await postTransition(body, 'internal-test-token')).status).toBe(422)
  })
})

describe('POST /triage/issues/lifecycle', () => {
  const body = {
    scope: 'project:p1',
    issueIds: [ISSUE_ID],
    status: 'archived',
    archive: { mode: 'events', count: 100 },
  }

  test('a signed-out caller is refused', async () => {
    const before = lifecycles.length
    expect((await postLifecycle(body)).status).toBe(401)
    expect(lifecycles).toHaveLength(before)
  })

  test('a member decides, and the response says whether whiskers took it', async () => {
    sessionUser = { id: 'u1' }
    const response = await postLifecycle(body)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ issues: [], mirrored: false })
    expect(lifecycles.at(-1)).toEqual(body)
    expect(published.at(-1)).toEqual(['issues'])
  })

  test('a scope the caller cannot triage is forbidden', async () => {
    sessionUser = { id: 'outsider' }
    expect((await postLifecycle(body)).status).toBe(403)
  })

  test('only a project scope can change issues', async () => {
    sessionUser = { id: 'u1' }
    const before = lifecycles.length
    expect((await postLifecycle({ ...body, scope: 'acme/api' })).status).toBe(422)
    expect((await postLifecycle({ ...body, scope: 'project:' })).status).toBe(422)
    expect(lifecycles).toHaveLength(before)
  })

  test('an archive without its count is refused before anything is written', async () => {
    sessionUser = { id: 'u1' }
    const response = await postLifecycle({ ...body, archive: { mode: 'events' } })
    expect(response.status).toBe(422)
  })
})

describe('GET /triage/activity', () => {
  const url = `http://studio.test/triage/activity?scope=project:p1&itemKind=issue&itemRef=${ISSUE_ID}`

  test('needs a session', async () => {
    expect((await triageRoutes.handle(new Request(url))).status).toBe(401)
  })

  test('a member reads the timeline', async () => {
    sessionUser = { id: 'u1' }
    const response = await triageRoutes.handle(new Request(url))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([])
  })
})

describe('GET /triage/activity/recent', () => {
  const read = (query = '') =>
    triageRoutes.handle(new Request(`http://studio.test/triage/activity/recent${query}`))

  test('needs a session and reads nothing without one', async () => {
    const before = recentReads.length
    expect((await read()).status).toBe(401)
    expect(recentReads).toHaveLength(before)
  })

  test('reads for the signed-in user with a default limit', async () => {
    sessionUser = { id: 'u1' }
    expect((await read()).status).toBe(200)
    expect(recentReads.at(-1)).toEqual({ userId: 'u1', limit: 40 })
  })

  test('refuses a limit past the cap', async () => {
    sessionUser = { id: 'u1' }
    expect((await read('?limit=500')).status).toBe(422)
    expect((await read('?limit=10')).status).toBe(200)
    expect(recentReads.at(-1)).toEqual({ userId: 'u1', limit: 10 })
  })
})
