import type { z } from 'zod'
import type {
  TELEMETRY_LEVELS,
  TRACE_SORTS,
  whiskersLogVolumeSchema,
  whiskersServiceStatsPageSchema,
  whiskersServiceStatsSchema,
  whiskersTraceContextSchema,
} from './telemetry-schemas'
import type { ProjectScope } from './types'

export type TelemetryLevel = (typeof TELEMETRY_LEVELS)[number]
export type TraceSort = (typeof TRACE_SORTS)[number]
export type WhiskersLogVolume = z.infer<typeof whiskersLogVolumeSchema>
export type WhiskersVolumeBucket = WhiskersLogVolume['buckets'][number]
export type WhiskersTraceContext = z.infer<typeof whiskersTraceContextSchema>
export type WhiskersServiceStats = z.infer<typeof whiskersServiceStatsSchema>
export type WhiskersServiceStatsPage = z.infer<typeof whiskersServiceStatsPageSchema>
export type WhiskersServicePoint = WhiskersServiceStats['points'][number]

/** A relative window is resolved when the request is made, so a refetch slides it forward. */
export type WindowSpec = { sinceMs: number } | { from: number; to: number }

export type LogFilterParams = {
  projectIds: ProjectScope
  service?: string
  levels?: TelemetryLevel[]
  q?: string
  traceId?: string
  attrs?: Record<string, string>
}

export type TraceListParams = {
  projectIds: ProjectScope
  service?: string
  q?: string
  hasErrors?: boolean
  minMs?: number
  sort?: TraceSort
}
