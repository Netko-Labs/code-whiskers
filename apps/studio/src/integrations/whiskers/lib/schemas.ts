import { z } from 'zod'

export const whiskersOverviewSchema = z.object({
  summary: z.object({ events: z.number(), issues: z.number() }),
})

export const whiskersIssueSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  fingerprint: z.string(),
  title: z.string(),
  level: z.string(),
  status: z.enum(['open', 'resolved']),
  eventCount: z.number(),
  firstSeen: z.coerce.date(),
  lastSeen: z.coerce.date(),
  lastRelease: z.string().nullable().default(null),
})

export const whiskersReviewSchema = z.object({
  id: z.string(),
  owner: z.string(),
  repo: z.string(),
  prNumber: z.number(),
  headSha: z.string(),
  title: z.string().nullable().default(null),
  author: z.string().nullable().default(null),
  additions: z.number().nullable().default(null),
  deletions: z.number().nullable().default(null),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  verdict: z.enum(['approve', 'request_changes', 'comment']).nullable(),
  summary: z.string().nullable(),
  model: z.string().nullable(),
  createdAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
  findingCount: z.number().default(0),
})

export const whiskersFindingSchema = z.object({
  id: z.string(),
  reviewId: z.string(),
  file: z.string(),
  line: z.number().nullable(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
  title: z.string(),
  body: z.string(),
  suggestion: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export const whiskersReviewDetailSchema = z.object({
  review: whiskersReviewSchema,
  findings: z.array(whiskersFindingSchema),
})

export const whiskersIssueListSchema = z.array(whiskersIssueSchema)
export const whiskersReviewListSchema = z.array(whiskersReviewSchema)

export const whiskersHotspotSchema = z.object({
  repository: z.string(),
  directory: z.string(),
  findings: z.number(),
  critical: z.number(),
  high: z.number(),
  medium: z.number(),
  low: z.number(),
  pullRequests: z.number(),
  lastSeen: z.coerce.date(),
})
export const whiskersHotspotListSchema = z.array(whiskersHotspotSchema)

export const whiskersInstanceSchema = z.object({
  telemetryRetentionDays: z.number().default(7),
  databaseBytes: z.number(),
  stores: z.array(
    z.object({
      table: z.string(),
      bytes: z.number(),
      rows: z.number(),
      isEstimate: z.boolean(),
      oldest: z.coerce.date().nullable(),
    }),
  ),
  activity: z.object({
    reviews24h: z.number(),
    reviews7d: z.number(),
    failed7d: z.number(),
    inFlight: z.number(),
    medianReviewSeconds: z.number().nullable(),
    events24h: z.number(),
    events7d: z.number(),
  }),
})

export const whiskersProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  publicKey: z.string(),
  createdAt: z.coerce.date(),
  issues: z.number().default(0),
  lastEventAt: z.coerce.date().nullable().default(null),
})
export const whiskersProjectListSchema = z.array(whiskersProjectSchema)

export const whiskersReleaseSchema = z.object({
  projectId: z.string(),
  release: z.string(),
  environment: z.string().nullable(),
  firstSeen: z.coerce.date(),
  lastSeen: z.coerce.date(),
  events: z.number(),
  issues: z.number(),
  newIssues: z.number(),
})
export const whiskersReleaseListSchema = z.array(whiskersReleaseSchema)

export const whiskersLogSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  service: z.string(),
  level: z.string(),
  message: z.string(),
  attributes: z.record(z.string(), z.unknown()).default({}),
  traceId: z.string().nullable(),
  spanId: z.string().nullable(),
  timestamp: z.coerce.date(),
})
export const whiskersLogListSchema = z.array(whiskersLogSchema)

export const whiskersTraceSchema = z.object({
  traceId: z.string(),
  rootName: z.string(),
  rootService: z.string(),
  startedAt: z.coerce.date(),
  durationMs: z.number(),
  spans: z.number(),
  errors: z.number(),
})
export const whiskersTraceListSchema = z.array(whiskersTraceSchema)

export const whiskersSpanSchema = z.object({
  spanId: z.string(),
  parentSpanId: z.string().nullable(),
  service: z.string(),
  name: z.string(),
  status: z.enum(['unset', 'ok', 'error']),
  startTime: z.coerce.date(),
  durationMs: z.number(),
})
export const whiskersSpanListSchema = z.array(whiskersSpanSchema)

export const whiskersServiceSchema = z.object({
  service: z.string(),
  logs: z.number(),
  logErrors: z.number(),
  spans: z.number(),
  spanErrors: z.number(),
  p50Ms: z.number().nullable(),
  p95Ms: z.number().nullable(),
  lastSeen: z.coerce.date().nullable(),
})
export const whiskersServiceListSchema = z.array(whiskersServiceSchema)
