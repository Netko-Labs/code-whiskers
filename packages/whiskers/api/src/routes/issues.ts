import {
  IssueDetailQuerySchema,
  IssueEventsQuerySchema,
  IssueListQuerySchema,
} from '@code-whiskers/whiskers-domain'
import {
  getIssue,
  getIssueEvent,
  getIssueEvents,
  getIssues,
  uuidsOf,
} from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'
import { projectIdsOf } from '../shared'

/** Grouped errors for a reader. The lifecycle is written through `/internal`, never here. */
export const issueRoutes = new Elysia({ name: 'issues', prefix: '/v1/issues' })
  // (o･ω･o) one page of issues, filtered and sorted server-side
  .get('', { query: IssueListQuerySchema }, async ({ query, status }) => {
    const page = await getIssues({
      query,
      projectIds: projectIdsOf(query.projectId),
      ids: uuidsOf(query.ids),
    })
    return page ?? status(400, { error: 'unknown cursor' })
  })
  // (・∀・) one issue with where, when and on what it happens
  .get('/:issueId', { query: IssueDetailQuerySchema }, async ({ params, query, status }) => {
    const detail = await getIssue(params.issueId, query.period)
    return detail ?? status(404, { error: 'no such issue' })
  })
  // (・∀・) its events, newest first
  .get('/:issueId/events', { query: IssueEventsQuerySchema }, async ({ params, query, status }) => {
    const page = await getIssueEvents(params.issueId, query)
    return page ?? status(400, { error: 'unknown cursor' })
  })
  // (・∀・) one event read for a human — a row id, `latest` or `oldest`
  .get('/:issueId/events/:eventId', async ({ params, status }) => {
    const event = await getIssueEvent(params.issueId, params.eventId)
    return event ?? status(404, { error: 'no such event' })
  })
  .get('/:issueId/latest-event', async ({ params, status }) => {
    const event = await getIssueEvent(params.issueId, 'latest')
    return event ?? status(404, { error: 'no events' })
  })
