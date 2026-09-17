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
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  verdict: z.enum(['approve', 'request_changes', 'comment']).nullable(),
  summary: z.string().nullable(),
  model: z.string().nullable(),
  createdAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
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
