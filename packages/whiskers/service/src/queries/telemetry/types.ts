import type { TELEMETRY_LEVELS, TRACE_SORTS } from '@code-whiskers/whiskers-domain'
import type { LEVEL_BANDS } from './constants'

export type TelemetryLevel = (typeof TELEMETRY_LEVELS)[number]
export type TraceSort = (typeof TRACE_SORTS)[number]
export type LevelBand = (typeof LEVEL_BANDS)[number]

export interface TimeWindow {
  from: Date
  to: Date
}

export interface LogFilter {
  projectIds?: string[]
  service?: string
  levels?: TelemetryLevel[]
  query?: string
  traceId?: string
  attrs?: Record<string, string>
  from?: Date
  to?: Date
}

export interface LogPage extends LogFilter {
  before?: number
  limit?: number
}

export type VolumeBucket = { start: Date } & Record<LevelBand, number>

export interface VolumeRow {
  bucket: number
  level: string
  count: number
}

export interface LogVolume {
  from: Date
  to: Date
  stepMs: number
  buckets: VolumeBucket[]
}

export interface TraceFilter {
  projectIds?: string[]
  service?: string
  query?: string
  hasErrors?: boolean
  minMs?: number
  sort: TraceSort
  from?: Date
  to?: Date
}

export interface TraceSummary {
  traceId: string
  rootName: string
  rootService: string
  startedAt: Date
  durationMs: number
  spans: number
  errors: number
}

export interface TraceError {
  eventId: string
  issueId: string
  title: string
  level: string
  receivedAt: Date
}

export interface TraceContext {
  logs: number
  errors: TraceError[]
}

export interface ServiceSummary {
  service: string
  logs: number
  logErrors: number
  spans: number
  spanErrors: number
  p50Ms: number | null
  p95Ms: number | null
  lastSeen: Date | null
}

export interface ServicePoint {
  start: Date
  requests: number
  errors: number
  p50Ms: number | null
  p95Ms: number | null
}

export interface ServiceStats {
  service: string
  requests: number
  errors: number
  p50Ms: number | null
  p95Ms: number | null
  logs: number
  logErrors: number
  lastSeen: Date | null
  points: ServicePoint[]
}

export interface ServiceStatsPage {
  from: Date
  to: Date
  stepMs: number
  services: ServiceStats[]
}

export interface ServicePointRow {
  service: string
  bucket: number
  requests: number
  errors: number
  p50Ms: number | null
  p95Ms: number | null
}

export interface ServiceTotalRow {
  service: string
  requests: number
  errors: number
  p50Ms: number | null
  p95Ms: number | null
  lastSeen: Date | null
}

export interface ServiceLogRow {
  service: string
  logs: number
  logErrors: number
  lastSeen: Date | null
}

export interface BucketPlan extends TimeWindow {
  stepMs: number
  count: number
}
