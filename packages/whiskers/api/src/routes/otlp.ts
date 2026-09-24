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

// Parsing happens before the per-request record cap, so the body itself must be bounded.
const MAX_BODY_BYTES = 5 * 1024 * 1024

class BodyTooLarge extends Error {}

async function jsonBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) throw new BodyTooLarge()
  const buffer = new Uint8Array(await request.arrayBuffer())
  if (buffer.byteLength > MAX_BODY_BYTES) throw new BodyTooLarge()
  const bytes = request.headers.get('content-encoding') === 'gzip' ? Bun.gunzipSync(buffer) : buffer
  if (bytes.byteLength > MAX_BODY_BYTES) throw new BodyTooLarge()
  return JSON.parse(new TextDecoder().decode(bytes))
}

async function readPayload(request: Request, set: { status?: number | string }) {
  try {
    return { payload: await jsonBody(request) }
  } catch (error) {
    set.status = error instanceof BodyTooLarge ? 413 : 400
    return {
      error:
        error instanceof BodyTooLarge
          ? 'OTLP body over 5 MB — lower the exporter batch size'
          : 'body is not valid JSON',
    }
  }
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
    const read = await readPayload(request, set)
    if ('error' in read) return read
    const rows = parseLogs(read.payload as OtlpLogs)
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
    const read = await readPayload(request, set)
    if ('error' in read) return read
    const rows = parseTraces(read.payload as OtlpTraces)
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
