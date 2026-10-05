import { afterEach, describe, expect, test } from 'bun:test'
import { probeWhiskers } from '../src/whiskers/health'

const realFetch = globalThis.fetch

const answer = (status: number, body: unknown) => {
  globalThis.fetch = (async () =>
    new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
    })) as unknown as typeof fetch
}

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('probeWhiskers', () => {
  test('ok with a release when the worker and its database answer', async () => {
    answer(200, { status: 'ok', release: 'abc123', environment: 'production' })
    const health = await probeWhiskers()
    expect(health.status).toBe('ok')
    expect(health.release).toBe('abc123')
    expect(health.latencyMs).toBeGreaterThanOrEqual(0)
  })

  test('degraded when the worker answers but its database check fails', async () => {
    answer(503, { status: 'degraded', release: 'abc123' })
    expect((await probeWhiskers()).status).toBe('degraded')
  })

  test('unreachable on a network failure or a body that is not the health shape', async () => {
    globalThis.fetch = (async () => {
      throw new Error('ECONNREFUSED')
    }) as unknown as typeof fetch
    expect(await probeWhiskers()).toMatchObject({ status: 'unreachable', latencyMs: null })

    answer(502, '<html>bad gateway</html>')
    expect((await probeWhiskers()).status).toBe('unreachable')
  })
})
