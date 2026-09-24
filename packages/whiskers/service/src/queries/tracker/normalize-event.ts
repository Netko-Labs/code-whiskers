import type { EventDetail, EventFrame } from './types'

type Loose = Record<string, unknown>

function obj(value: unknown): Loose {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Loose) : {}
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  const values = obj(value).values
  return Array.isArray(values) ? values : []
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value
    ? value
    : typeof value === 'number'
      ? String(value)
      : null
}

const MAX_FRAMES = 40
const MAX_CRUMBS = 20

/** Sentry sends frames oldest-first; a reader wants the throwing frame on top. */
function framesOf(payload: Loose): EventFrame[] {
  const exceptions = list(payload.exception)
  const last = obj(exceptions[exceptions.length - 1])
  return list(obj(last.stacktrace).frames)
    .map((raw) => {
      const frame = obj(raw)
      return {
        file: str(frame.filename) ?? str(frame.abs_path) ?? str(frame.module) ?? '<unknown>',
        function: str(frame.function) ?? '<anonymous>',
        line: typeof frame.lineno === 'number' ? frame.lineno : null,
        column: typeof frame.colno === 'number' ? frame.colno : null,
        isInApp: frame.in_app !== false && !String(frame.filename ?? '').includes('node_modules'),
        context: str(frame.context_line),
      }
    })
    .reverse()
    .slice(0, MAX_FRAMES)
}

function tagsOf(payload: Loose): Record<string, string> {
  const tags = payload.tags
  if (Array.isArray(tags)) {
    return Object.fromEntries(
      tags
        .filter((pair): pair is [unknown, unknown] => Array.isArray(pair) && pair.length === 2)
        .map(([key, value]) => [String(key), String(value)]),
    )
  }
  return Object.fromEntries(Object.entries(obj(tags)).map(([key, value]) => [key, String(value)]))
}

export function normalizeEvent(payload: unknown): Omit<EventDetail, 'receivedAt' | 'logs'> {
  const event = obj(payload)
  const exceptions = list(event.exception)
  const last = obj(exceptions[exceptions.length - 1])
  const request = obj(event.request)
  return {
    level: str(event.level) ?? 'error',
    message:
      [str(last.type), str(last.value)].filter(Boolean).join(': ') ||
      str(obj(event.logentry).message) ||
      str(event.message) ||
      'No message',
    environment: str(event.environment),
    release: str(event.release),
    traceId: str(obj(obj(event.contexts).trace).trace_id),
    frames: framesOf(event),
    breadcrumbs: list(event.breadcrumbs)
      .slice(-MAX_CRUMBS)
      .map((raw) => {
        const crumb = obj(raw)
        return {
          timestamp: str(crumb.timestamp),
          category: str(crumb.category) ?? str(crumb.type) ?? 'default',
          level: str(crumb.level) ?? 'info',
          message: str(crumb.message) ?? JSON.stringify(crumb.data ?? {}),
        }
      }),
    tags: tagsOf(event),
    request: str(request.url) ? { method: str(request.method), url: str(request.url) } : null,
  }
}
