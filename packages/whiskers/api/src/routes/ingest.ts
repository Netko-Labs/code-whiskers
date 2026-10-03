import { createLogger } from '@code-whiskers/logger'
import {
  ingestEvent,
  parseEnvelope,
  parseStoreEvent,
  readIngestBody,
  resolveProject,
} from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'

const logger = createLogger('whiskers-ingest')

function sentryKeyFrom(
  request: Request,
  query: Record<string, string | undefined>,
): string | undefined {
  if (query.sentry_key) return query.sentry_key
  const header = request.headers.get('x-sentry-auth')
  return header?.match(/sentry_key=([^,\s]+)/)?.[1]
}

/** Sentry SDK compatibility surface: the envelope endpoint plus the legacy store API. */
export const ingestRoutes = new Elysia({ name: 'ingest', prefix: '/api' })
  // (ノ´ヮ`)ノ*: envelopes in, issues out
  .post('/:projectId/envelope', async ({ request, params, query, set }) => {
    const project = await resolveProject(params.projectId, sentryKeyFrom(request, query))
    if (!project) {
      set.status = 401
      return { error: 'unknown project or bad sentry_key' }
    }
    const body = await readIngestBody(request)
    if (!body.ok) {
      set.status = body.status
      return { error: body.error }
    }
    const events = parseEnvelope(body.bytes)
    await Promise.all(events.map((event) => ingestEvent(project.id, event)))
    logger.info({ projectId: project.id, events: events.length }, 'envelope ingested')
    return { id: events[0]?.event_id ?? crypto.randomUUID().replaceAll('-', '') }
  })
  // (￣▽￣)ノ legacy /store — one JSON event per POST
  .post('/:projectId/store', async ({ request, params, query, set }) => {
    const project = await resolveProject(params.projectId, sentryKeyFrom(request, query))
    if (!project) {
      set.status = 401
      return { error: 'unknown project or bad sentry_key' }
    }
    const body = await readIngestBody(request)
    if (!body.ok) {
      set.status = body.status
      return { error: body.error }
    }
    const event = parseStoreEvent(body.bytes)
    if (!event) {
      set.status = 400
      return { error: 'malformed event' }
    }
    await ingestEvent(project.id, event)
    return { id: event.event_id ?? crypto.randomUUID().replaceAll('-', '') }
  })
