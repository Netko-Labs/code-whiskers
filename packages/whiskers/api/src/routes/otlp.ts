import { createLogger } from '@code-whiskers/logger'
import {
  ingestLogs,
  ingestSpans,
  type OtlpLogs,
  type OtlpTraces,
  parseLogs,
  parseTraces,
  projectForKey,
} from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'

const logger = createLogger('whiskers-otlp')

function keyFrom(request: Request): string | undefined {
  const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1]
  return bearer ?? request.headers.get('x-codewhiskers-key') ?? undefined
}

async function jsonBody(request: Request): Promise<unknown> {
  const buffer = new Uint8Array(await request.arrayBuffer())
  const bytes = request.headers.get('content-encoding') === 'gzip' ? Bun.gunzipSync(buffer) : buffer
  return JSON.parse(new TextDecoder().decode(bytes))
}

/**
 * OTLP/HTTP with JSON bodies. Protobuf is refused with a pointer to the setting that switches an
 * exporter to JSON, rather than half-parsed.
 */
export const otlpRoutes = new Elysia({ name: 'otlp', prefix: '/otlp/v1' })
  // (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ log records in
  .post('/logs', async ({ request, set }) => {
    const refusal = await refuse(request, set)
    if (refusal) return refusal
    const project = await projectForKey(keyFrom(request))
    if (!project) {
      set.status = 401
      return { error: 'unknown or missing project key' }
    }
    const rows = parseLogs((await jsonBody(request)) as OtlpLogs)
    await ingestLogs(project.id, rows)
    logger.info({ projectId: project.id, logs: rows.length }, 'otlp logs ingested')
    return { partialSuccess: {} }
  })
  // (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ spans in
  .post('/traces', async ({ request, set }) => {
    const refusal = await refuse(request, set)
    if (refusal) return refusal
    const project = await projectForKey(keyFrom(request))
    if (!project) {
      set.status = 401
      return { error: 'unknown or missing project key' }
    }
    const rows = parseTraces((await jsonBody(request)) as OtlpTraces)
    await ingestSpans(project.id, rows)
    logger.info({ projectId: project.id, spans: rows.length }, 'otlp spans ingested')
    return { partialSuccess: {} }
  })

async function refuse(request: Request, set: { status?: number | string }) {
  const type = request.headers.get('content-type') ?? ''
  if (type.includes('application/json')) return null
  set.status = 415
  return { error: 'send OTLP as JSON: set OTEL_EXPORTER_OTLP_PROTOCOL=http/json' }
}
