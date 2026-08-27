import { getIssues, getOverview, getReview, getReviews } from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'
import { z } from 'zod'

/** Read-only management surface for dashboards and smoke tests. */
export const insightRoutes = new Elysia({ name: 'insights', prefix: '/v1' })
  // (◕‿◕) the 10,000-foot view
  .get('/overview', () => getOverview())
  // (o･ω･o) grouped errors, newest churn first
  .get('/issues', { query: z.object({ projectId: z.string().optional() }) }, ({ query }) =>
    getIssues(query.projectId),
  )
  // ʕ•ᴥ•ʔ every review the cat has done
  .get('/reviews', () => getReviews())
  // (=^･ω･^=) one review with its findings
  .get('/reviews/:reviewId', async ({ params, set }) => {
    const result = await getReview(params.reviewId)
    if (!result) {
      set.status = 404
      return { error: 'not found' }
    }
    return result
  })
