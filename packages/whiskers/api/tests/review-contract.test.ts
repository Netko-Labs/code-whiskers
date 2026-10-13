import { describe, expect, mock, test } from 'bun:test'
import type { ReviewContract } from '@code-whiskers/whiskers-domain'

const CONTRACT: ReviewContract = {
  pr: 'acme/shop#41',
  head: '9f3013a',
  round: 2,
  verdict: 'needs_changes',
  blockers: [],
  suggestions: [],
  fixed_since_last_round: ['wf_19ab00'],
}
const asked: unknown[][] = []

// Bun keeps a module mock for the rest of the process: spread the real module.
const realService = await import('@code-whiskers/whiskers-service')
mock.module('@code-whiskers/whiskers-service', () => ({
  ...realService,
  getPullRequestContract: async (owner: string, repo: string, prNumber: number) => {
    asked.push([owner, repo, prNumber])
    return prNumber === 41 ? CONTRACT : undefined
  },
}))

const { insightRoutes } = await import('../src/routes/insights')

const get = (path: string) => insightRoutes.handle(new Request(`http://whiskers.test${path}`))

describe('GET /v1/reviews/pr/:owner/:repo/:number', () => {
  test('the latest completed review as the loop contract', async () => {
    const response = await get('/v1/reviews/pr/acme/shop/41')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(CONTRACT)
    expect(asked.at(-1)).toEqual(['acme', 'shop', 41])
  })

  test('a PR with no completed review is a 404', async () => {
    expect((await get('/v1/reviews/pr/acme/shop/7')).status).toBe(404)
  })

  test('a number that is not one is refused', async () => {
    expect((await get('/v1/reviews/pr/acme/shop/abc')).status).toBe(422)
  })
})
