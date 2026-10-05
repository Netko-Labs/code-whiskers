import { describe, expect, mock, test } from 'bun:test'
import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'

whiskersEnvConfig.app.internalToken = 'internal-test-token'

const mirrored: unknown[] = []
const previewed: unknown[] = []

// Bun keeps a module mock for the rest of the process: spread the real module so later test
// files importing it still find every export.
const realService = await import('@code-whiskers/whiskers-service')
mock.module('@code-whiskers/whiskers-service', () => ({
  ...realService,
  setIssueLifecycle: async (body: unknown) => {
    mirrored.push(body)
    return []
  },
  previewCondition: async (body: unknown) => {
    previewed.push(body)
    return { count: 3, days: [0, 0, 0, 0, 1, 0, 2], isCapped: false }
  },
}))

const { internalRoutes } = await import('../src/routes/internal')

const ISSUE_ID = '6762076c-880a-40ba-ac33-2830f16207d5'

const postLifecycle = (body: unknown, token?: string) =>
  internalRoutes.handle(
    new Request('http://whiskers.test/internal/issues/lifecycle', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token && { authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    }),
  )

describe('POST /internal/issues/lifecycle', () => {
  const body = {
    projectId: 'p1',
    issueIds: [ISSUE_ID],
    status: 'resolved',
    resolve: { mode: 'next_release' },
  }

  test('studio with the token mirrors a decision', async () => {
    const response = await postLifecycle(body, 'internal-test-token')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ issues: [] })
    expect(mirrored.at(-1)).toEqual(body)
  })

  test('no token, or the wrong one, changes nothing', async () => {
    const before = mirrored.length
    expect((await postLifecycle(body)).status).toBe(401)
    expect((await postLifecycle(body, 'internal-test-tokeX')).status).toBe(401)
    expect(mirrored).toHaveLength(before)
  })

  test('a decision not bound to a project is refused', async () => {
    const { projectId: _, ...unbound } = body
    const before = mirrored.length
    expect((await postLifecycle(unbound, 'internal-test-token')).status).toBe(422)
    expect(mirrored).toHaveLength(before)
  })

  test('a selection past 100 issues is refused', async () => {
    const tooMany = { ...body, issueIds: Array.from({ length: 101 }, () => ISSUE_ID) }
    expect((await postLifecycle(tooMany, 'internal-test-token')).status).toBe(422)
  })
})

describe('POST /internal/alerts/preview', () => {
  const draft = {
    triggers: ['new_issue', 'issue_regressed'],
    projectIds: [],
    environment: 'production',
    minLevel: null,
    release: null,
    threshold: 1,
    windowMinutes: 5,
    actionIntervalMinutes: 30,
    owner: 'netko-labs',
  }
  const postPreview = (body: unknown, token?: string) =>
    internalRoutes.handle(
      new Request('http://whiskers.test/internal/alerts/preview', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token && { authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      }),
    )

  test('studio with the token gets a week of counts', async () => {
    const response = await postPreview(draft, 'internal-test-token')
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ count: 3 })
    expect(previewed.at(-1)).toEqual(draft)
  })

  test('without the token nothing is counted', async () => {
    const before = previewed.length
    expect((await postPreview(draft)).status).toBe(401)
    expect(previewed).toHaveLength(before)
  })

  test('a draft without an owner is refused', async () => {
    const { owner: _, ...unscoped } = draft
    expect((await postPreview(unscoped, 'internal-test-token')).status).toBe(422)
  })
})
