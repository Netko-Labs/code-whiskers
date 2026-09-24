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
