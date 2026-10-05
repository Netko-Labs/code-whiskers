import { z } from 'zod'
import {
  MAX_ATTRIBUTE_FILTERS,
  MAX_BUCKETS,
  MAX_LOG_PAGE,
  MIN_BUCKETS,
  TELEMETRY_LEVELS,
  TRACE_SORTS,
} from '../values'
import { ProjectScopeSchema } from './project'

const EpochMsSchema = z.coerce
  .number()
  .int()
  .positive()
  .transform((ms) => new Date(ms))

const TextSchema = z.string().trim().min(1).max(200)

const LevelListSchema = z
  .string()
  .max(200)
  .transform((value) =>
    value
      .split(',')
      .map((level) => level.trim().toLowerCase())
      .filter(Boolean),
  )
  .pipe(z.array(z.enum(TELEMETRY_LEVELS)).max(TELEMETRY_LEVELS.length))

/** `{"http.status_code":"500"}` as a JSON string: query strings carry no objects. */
const AttributeFilterSchema = z
  .string()
  .max(4_000)
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown
    } catch {
      ctx.addIssue({ code: 'custom', message: 'attrs must be a JSON object' })
      return z.NEVER
    }
  })
  .pipe(
    z
      .record(z.string().trim().min(1).max(120), z.string().max(200))
      .refine((attrs) => Object.keys(attrs).length <= MAX_ATTRIBUTE_FILTERS, 'too many attrs'),
  )

const bucketCount = (fallback: number) =>
  z.coerce.number().int().min(MIN_BUCKETS).max(MAX_BUCKETS).default(fallback)

/** Epoch milliseconds; an open end falls back to the endpoint's default window. */
export const TelemetryRangeSchema = ProjectScopeSchema.extend({
  from: EpochMsSchema.optional(),
  to: EpochMsSchema.optional(),
})

export const LogFilterSchema = TelemetryRangeSchema.extend({
  service: TextSchema.optional(),
  levels: LevelListSchema.optional(),
  q: TextSchema.optional(),
  traceId: TextSchema.optional(),
  attrs: AttributeFilterSchema.optional(),
})
export type LogFilterQuery = z.infer<typeof LogFilterSchema>

export const LogQuerySchema = LogFilterSchema.extend({
  before: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LOG_PAGE).optional(),
})
export type LogQuery = z.infer<typeof LogQuerySchema>

export const LogVolumeQuerySchema = LogFilterSchema.extend({ buckets: bucketCount(60) })
export type LogVolumeQuery = z.infer<typeof LogVolumeQuerySchema>

export const TraceQuerySchema = TelemetryRangeSchema.extend({
  service: TextSchema.optional(),
  q: TextSchema.optional(),
  errors: z.enum(['true', 'false']).optional(),
  minMs: z.coerce.number().min(0).optional(),
  sort: z.enum(TRACE_SORTS).default('recent'),
})
export type TraceQuery = z.infer<typeof TraceQuerySchema>

export const ServiceStatsQuerySchema = TelemetryRangeSchema.extend({ buckets: bucketCount(24) })
export type ServiceStatsQuery = z.infer<typeof ServiceStatsQuerySchema>

export const TraceParamsSchema = z.object({ traceId: z.string().trim().min(1).max(200) })
