import {
  OverviewQuerySchema,
  PullRequestParamSchema,
  ReviewIdParamSchema,
  ReviewRerunSchema,
} from '@code-whiskers/whiskers-domain'
import {
  getHotspots,
  getInstanceStats,
  getOverview,
  getPullRequestContract,
  getPullRequestReviews,
  getReview,
  getReviews,
  runReview,
} from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'
import { projectIdsOf } from '../shared'

/** Read-only management surface for dashboards and smoke tests. */
export const insightRoutes = new Elysia({ name: 'insights', prefix: '/v1' })
  // (◕‿◕) the 10,000-foot view, bucketed over a range
  .get('/overview', { query: OverviewQuerySchema }, ({ query }) =>
    getOverview({
      range: query.range,
      projectIds: projectIdsOf(query.projectId),
      repository: query.repository?.trim() || undefined,
    }),
  )
  // (￣ー￣) what the worker holds and whether it keeps up
  .get('/instance', () => getInstanceStats())
  // (・_・ヾ where findings keep landing
  .get('/hotspots', () => getHotspots())
  // (ง'̀-'́)ง run the review again on the pull request's current head
  .post('/reviews/rerun', { body: ReviewRerunSchema }, ({ body }) => {
    void runReview(body, { force: true }).catch(() => undefined)
    return { queued: true }
  })
  // ʕ•ᴥ•ʔ every review the cat has done
  .get('/reviews', () => getReviews())
  // (•̀ᴗ•́)و what the latest review of a PR asks of whoever is fixing it
  .get(
    '/reviews/pr/:owner/:repo/:number',
    { params: PullRequestParamSchema },
    async ({ params, status }) => {
      const contract = await getPullRequestContract(params.owner, params.repo, params.number)
      return contract ?? status(404, { error: 'no completed review of that pull request' })
    },
  )
  // (=^･ω･^=) one review with its findings
  .get('/reviews/:reviewId', async ({ params, set }) => {
    const result = await getReview(params.reviewId)
    if (!result) {
      set.status = 404
      return { error: 'not found' }
    }
    return result
  })
  // (=^･ω･^=)ﾉ every reviewed push of that review's pull request, with all their findings
  .get(
    '/reviews/:reviewId/pull-request',
    { params: ReviewIdParamSchema },
    async ({ params, set }) => {
      const result = await getPullRequestReviews(params.reviewId)
      if (!result) {
        set.status = 404
        return { error: 'not found' }
      }
      return result
    },
  )
