import { createLogger } from '@code-whiskers/logger'
import { SentryEventSchema } from '@code-whiskers/whiskers-domain'
import { ingestEvent, parseEnvelope, resolveProject } from '@code-whiskers/whiskers-service'
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

async function rawBody(request: Request): Promise<string> {
  const buffer = new Uint8Array(await request.arrayBuffer())
  if (request.headers.get('content-encoding') === 'gzip') {
    return new TextDecoder().decode(Bun.gunzipSync(buffer))
  }
  return new TextDecoder().decode(buffer)
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
    const events = parseEnvelope(await rawBody(request))
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
    const parsed = SentryEventSchema.safeParse(JSON.parse(await rawBody(request)))
    if (!parsed.success) {
      set.status = 400
      return { error: 'malformed event' }
    }
    await ingestEvent(project.id, parsed.data)
    return { id: parsed.data.event_id ?? crypto.randomUUID().replaceAll('-', '') }
  })
