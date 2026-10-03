import { describe, expect, test } from 'bun:test'
import { Elysia } from 'elysia'
import { originGuard } from '../src/shared'

const app = new Elysia({ prefix: '/api' })
  .use(originGuard)
  .post('/rules', () => 'ok')
  .post('/:projectId/envelope', () => 'ok')
  .get('/rules', () => 'ok')

const post = (path: string, origin?: string) =>
  app.handle(
    new Request(`https://studio.localhost${path}`, {
      method: 'POST',
      headers: origin ? { origin } : {},
    }),
  )

describe('originGuard', () => {
  test('a cross-site write is refused', async () => {
    expect((await post('/api/rules', 'https://evil.example')).status).toBe(403)
  })

  test('our own pages and origin-less clients write', async () => {
    expect((await post('/api/rules', 'https://studio.localhost')).status).toBe(200)
    expect((await post('/api/rules')).status).toBe(200)
  })

  test('browser SDKs on other sites still reach the ingest', async () => {
    expect((await post('/api/42/envelope', 'https://customer.example')).status).toBe(200)
  })

  test('reads are never blocked', async () => {
    const response = await app.handle(
      new Request('https://studio.localhost/api/rules', {
        headers: { origin: 'https://evil.example' },
      }),
    )
    expect(response.status).toBe(200)
  })
})
