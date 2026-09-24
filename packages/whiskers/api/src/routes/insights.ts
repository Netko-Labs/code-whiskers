import {
  LogQuerySchema,
  ProjectCreateSchema,
  ReviewRerunSchema,
  TraceQuerySchema,
} from '@code-whiskers/whiskers-domain'
import {
  createProject,
  getHotspots,
  getInstanceStats,
  getIssues,
  getLatestEvent,
  getLogPatterns,
  getLogs,
  getOverview,
  getProjects,
  getReleases,
  getReview,
  getReviews,
  getServices,
  getTrace,
  getTraces,
  runReview,
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
  // (｀-´)> log lines, newest first; `before` pages back by id
  .get('/logs', { query: LogQuerySchema }, ({ query }) =>
    getLogs({ service: query.service, level: query.level, query: query.q, before: query.before }),
  )
  // (｀-´)> error log lines grouped by shape — the log side of triage
  .get('/log-patterns', () => getLogPatterns())
  // (｀-´)> traces from the last day, and one trace's spans
  .get('/traces', { query: TraceQuerySchema }, ({ query }) => getTraces(query.service))
  .get('/traces/:traceId', ({ params }) => getTrace(params.traceId))
  // (｀-´)> every service that logged or traced today
  .get('/services', () => getServices())
  // (ﾉ≧∀≦)ﾉ what each release brought in
  .get('/releases', () => getReleases())
  // (・_・ヾ where findings keep landing
  .get('/hotspots', () => getHotspots())
  // (・∀・) the newest event of one issue, read for a human
  .get('/issues/:issueId/latest-event', async ({ params, set }) => {
    const event = await getLatestEvent(params.issueId)
    if (!event) {
      set.status = 404
      return { error: 'no events' }
    }
    return event
  })
  // (ง'̀-'́)ง run the review again on the pull request's current head
  .post('/reviews/rerun', { body: ReviewRerunSchema }, ({ body }) => {
    void runReview(body).catch(() => undefined)
    return { queued: true }
  })
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
