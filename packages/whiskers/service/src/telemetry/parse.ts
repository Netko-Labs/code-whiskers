import {
  MAX_MESSAGE_CHARS,
  MAX_RECORDS_PER_REQUEST,
  SEVERITY_LEVELS,
  UNKNOWN_SERVICE,
} from './constants'
import type {
  LogLineInput,
  OtlpAttribute,
  OtlpLogs,
  OtlpTraces,
  OtlpValue,
  SpanInput,
} from './types'

export function anyValue(value: OtlpValue | undefined): unknown {
  if (!value) return null
  if (value.stringValue !== undefined) return value.stringValue
  if (value.intValue !== undefined) return Number(value.intValue)
  if (value.doubleValue !== undefined) return value.doubleValue
  if (value.boolValue !== undefined) return value.boolValue
  if (value.arrayValue) return (value.arrayValue.values ?? []).map(anyValue)
  if (value.kvlistValue) return attributesOf(value.kvlistValue.values)
  return null
}

export function attributesOf(attributes: OtlpAttribute[] | undefined): Record<string, unknown> {
  return Object.fromEntries((attributes ?? []).map((a) => [a.key, anyValue(a.value)]))
}

/** OTLP carries nanoseconds as a decimal string; Date wants milliseconds. */
export function fromNanos(nanos: string | undefined, fallback = new Date()): Date {
  if (!nanos || nanos === '0') return fallback
  try {
    return new Date(Number(BigInt(nanos) / 1_000_000n))
  } catch {
    return fallback
  }
}

export function logLevelOf(
  severityNumber: number | undefined,
  severityText: string | undefined,
): string {
  if (severityNumber) {
    const match = SEVERITY_LEVELS.find((band) => severityNumber <= band.upTo)
    if (match) return match.level
  }
  const text = severityText?.trim().toUpperCase()
  if (text === 'WARNING') return 'WARN'
  return text || 'INFO'
}

/** Numeric (1, 2) in some exporters, the enum name in others. */
export function statusOf(code: number | string | undefined): 'unset' | 'ok' | 'error' {
  if (code === 2 || code === 'STATUS_CODE_ERROR') return 'error'
  if (code === 1 || code === 'STATUS_CODE_OK') return 'ok'
  return 'unset'
}

function serviceOf(attributes: OtlpAttribute[] | undefined): string {
  const name = attributes?.find((a) => a.key === 'service.name')?.value?.stringValue
  return name?.trim() || UNKNOWN_SERVICE
}

function messageOf(body: OtlpValue | undefined): string {
  const value = anyValue(body)
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '')
  return text.length > MAX_MESSAGE_CHARS ? `${text.slice(0, MAX_MESSAGE_CHARS)}…` : text
}

export function parseLogs(payload: OtlpLogs, now = new Date()): LogLineInput[] {
  const rows: LogLineInput[] = []
  for (const resourceLogs of payload.resourceLogs ?? []) {
    const service = serviceOf(resourceLogs.resource?.attributes)
    for (const scope of resourceLogs.scopeLogs ?? []) {
      for (const record of scope.logRecords ?? []) {
        if (rows.length >= MAX_RECORDS_PER_REQUEST) return rows
        rows.push({
          service,
          level: logLevelOf(record.severityNumber, record.severityText),
          severity: record.severityNumber ?? 0,
          message: messageOf(record.body),
          attributes: attributesOf(record.attributes),
          traceId: record.traceId || null,
          spanId: record.spanId || null,
          timestamp: fromNanos(record.timeUnixNano ?? record.observedTimeUnixNano, now),
        })
      }
    }
  }
  return rows
}

export function parseTraces(payload: OtlpTraces, now = new Date()): SpanInput[] {
  const rows: SpanInput[] = []
  for (const resourceSpans of payload.resourceSpans ?? []) {
    const service = serviceOf(resourceSpans.resource?.attributes)
    for (const scope of resourceSpans.scopeSpans ?? []) {
      for (const span of scope.spans ?? []) {
        if (rows.length >= MAX_RECORDS_PER_REQUEST) return rows
        if (!span.traceId || !span.spanId) continue
        const start = fromNanos(span.startTimeUnixNano, now)
        const end = fromNanos(span.endTimeUnixNano, start)
        rows.push({
          traceId: span.traceId,
          spanId: span.spanId,
          parentSpanId: span.parentSpanId || null,
          service,
          name: span.name || '(unnamed)',
          kind: typeof span.kind === 'number' ? span.kind : 0,
          status: statusOf(span.status?.code),
          startTime: start,
          durationMs: Math.max(0, end.getTime() - start.getTime()),
          attributes: attributesOf(span.attributes),
        })
      }
    }
  }
  return rows
}
