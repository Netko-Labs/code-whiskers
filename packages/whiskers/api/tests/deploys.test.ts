import { describe, expect, mock, test } from 'bun:test'
import type { DeployBody } from '@code-whiskers/whiskers-domain'

const KEY = 'k'.repeat(32)
const PROJECT = { id: '7', name: 'web', repository: 'acme/web', legacyPublicKey: null }
const recorded: DeployBody[] = []

// Bun keeps a module mock for the rest of the process: spread the real module.
const realService = await import('@code-whiskers/whiskers-service')
mock.module('@code-whiskers/whiskers-service', () => ({
  ...realService,
  resolveProject: async (projectId: string, key: string | undefined) =>
    projectId === PROJECT.id && key === KEY ? { ...PROJECT, createdAt: new Date() } : undefined,
  recordDeploy: async (_project: unknown, body: DeployBody) => {
    recorded.push(body)
    return {
      ok: true,
      releaseId: 'r',
      deployId: 'd',
      version: body.version,
      environment: body.environment,
    }
  },
}))

const { deployRoutes } = await import('../src/routes/deploys')

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  deployRoutes.handle(
    new Request(`http://whiskers.test${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
  )

const DEPLOY = { version: '1.4.0', environment: 'production', commitSha: 'abc1234' }

describe('POST /api/:projectId/deploys', () => {
  test('a client key in the DSN header records the deploy', async () => {
    const response = await post('/api/7/deploys', DEPLOY, { authorization: `DSN ${KEY}` })
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      id: 'd',
      release: '1.4.0',
      environment: 'production',
    })
    expect(recorded.at(-1)).toMatchObject(DEPLOY)
  })

  test('the key may ride in the query, like a browser SDK sends it', async () => {
    const response = await post(`/api/7/deploys?sentry_key=${KEY}`, DEPLOY)
    expect(response.status).toBe(201)
  })

  test('no key, a wrong key or another project is refused', async () => {
    const before = recorded.length
    expect((await post('/api/7/deploys', DEPLOY)).status).toBe(401)
    expect((await post('/api/7/deploys', DEPLOY, { authorization: 'DSN nope' })).status).toBe(401)
    expect((await post('/api/8/deploys', DEPLOY, { authorization: `DSN ${KEY}` })).status).toBe(401)
    expect(recorded).toHaveLength(before)
  })

  test('a deploy without a version or with a bad sha never reaches the service', async () => {
    const before = recorded.length
    const auth = { authorization: `DSN ${KEY}` }
    expect((await post('/api/7/deploys', { environment: 'production' }, auth)).status).toBe(422)
    expect((await post('/api/7/deploys', { ...DEPLOY, commitSha: 'main' }, auth)).status).toBe(422)
    expect(recorded).toHaveLength(before)
  })
})
