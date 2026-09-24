import { ProjectCreateSchema } from '@code-whiskers/whiskers-domain'
import {
  createProject,
  getHotspots,
  getInstanceStats,
  getIssues,
  getOverview,
  getProjects,
  getReview,
  getReviews,
} from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'
import { z } from 'zod'

/** Read-only management surface for dashboards and smoke tests. */
export const insightRoutes = new Elysia({ name: 'insights', prefix: '/v1' })
  // (◕‿◕) the 10,000-foot view
  .get('/overview', () => getOverview())
  // (ノ°▽°)ノ where error events come from, and the DSN each one uses
  .get('/projects', () => getProjects())
  .post('/projects', { body: ProjectCreateSchema }, ({ body }) => createProject(body.name))
  // (o･ω･o) grouped errors, newest churn first
  .get('/issues', { query: z.object({ projectId: z.string().optional() }) }, ({ query }) =>
    getIssues(query.projectId),
  )
  // (￣ー￣) what the worker holds and whether it keeps up
  .get('/instance', () => getInstanceStats())
  // (・_・ヾ where findings keep landing
  .get('/hotspots', () => getHotspots())
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
