import type { logLineTable, spanTable } from '@code-whiskers/whiskers-domain'

export type OtlpValue = {
  stringValue?: string
  intValue?: string | number
  doubleValue?: number
  boolValue?: boolean
  arrayValue?: { values?: OtlpValue[] }
  kvlistValue?: { values?: OtlpAttribute[] }
}

export type OtlpAttribute = { key: string; value?: OtlpValue }

export type OtlpResource = { attributes?: OtlpAttribute[] }

export type OtlpLogRecord = {
  timeUnixNano?: string
  observedTimeUnixNano?: string
  severityNumber?: number
  severityText?: string
  body?: OtlpValue
  attributes?: OtlpAttribute[]
  traceId?: string
  spanId?: string
}

export type OtlpLogs = {
  resourceLogs?: {
    resource?: OtlpResource
    scopeLogs?: { logRecords?: OtlpLogRecord[] }[]
  }[]
}

export type OtlpSpan = {
  traceId?: string
  spanId?: string
  parentSpanId?: string
  name?: string
  kind?: number | string
  startTimeUnixNano?: string
  endTimeUnixNano?: string
  status?: { code?: number | string }
  attributes?: OtlpAttribute[]
}

export type OtlpTraces = {
  resourceSpans?: {
    resource?: OtlpResource
    scopeSpans?: { spans?: OtlpSpan[] }[]
  }[]
}

export type LogLineInput = Omit<typeof logLineTable.$inferInsert, 'projectId'>
export type SpanInput = Omit<typeof spanTable.$inferInsert, 'projectId'>
