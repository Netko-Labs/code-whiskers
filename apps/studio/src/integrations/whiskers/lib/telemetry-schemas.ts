import { z } from 'zod'

export const TELEMETRY_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const
export const TRACE_SORTS = ['recent', 'slowest'] as const
export const LOG_PAGE_SIZE = 200

export const whiskersLogVolumeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  stepMs: z.number(),
  buckets: z.array(
    z.object({
      start: z.coerce.date(),
      error: z.number(),
      warn: z.number(),
      info: z.number(),
      debug: z.number(),
    }),
  ),
})

export const whiskersTraceContextSchema = z.object({
  logs: z.number(),
  errors: z.array(
    z.object({
      eventId: z.string(),
      issueId: z.string(),
      title: z.string(),
      level: z.string(),
      receivedAt: z.coerce.date(),
    }),
  ),
})

const servicePointSchema = z.object({
  start: z.coerce.date(),
  requests: z.number(),
  errors: z.number(),
  p50Ms: z.number().nullable(),
  p95Ms: z.number().nullable(),
})

export const whiskersServiceStatsSchema = z.object({
  service: z.string(),
  requests: z.number(),
  errors: z.number(),
  p50Ms: z.number().nullable(),
  p95Ms: z.number().nullable(),
  logs: z.number(),
  logErrors: z.number(),
  lastSeen: z.coerce.date().nullable(),
  points: z.array(servicePointSchema),
})

export const whiskersServiceStatsPageSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  stepMs: z.number(),
  services: z.array(whiskersServiceStatsSchema),
})
