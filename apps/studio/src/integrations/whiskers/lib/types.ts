import type { z } from 'zod'
import type {
  whiskersEventDetailSchema,
  whiskersFindingSchema,
  whiskersHotspotSchema,
  whiskersInstanceSchema,
  whiskersIssueSchema,
  whiskersLogSchema,
  whiskersOverviewSchema,
  whiskersProjectSchema,
  whiskersReleaseSchema,
  whiskersReviewDetailSchema,
  whiskersReviewSchema,
  whiskersServiceSchema,
  whiskersSpanSchema,
  whiskersTraceSchema,
} from './schemas'

export type WhiskersOverview = z.infer<typeof whiskersOverviewSchema>
export type WhiskersIssue = z.infer<typeof whiskersIssueSchema>
export type WhiskersReview = z.infer<typeof whiskersReviewSchema>
export type WhiskersFinding = z.infer<typeof whiskersFindingSchema>
export type WhiskersReviewDetail = z.infer<typeof whiskersReviewDetailSchema>
export type WhiskersHotspot = z.infer<typeof whiskersHotspotSchema>
export type WhiskersInstance = z.infer<typeof whiskersInstanceSchema>
export type WhiskersProject = z.infer<typeof whiskersProjectSchema>
export type WhiskersRelease = z.infer<typeof whiskersReleaseSchema>
export type WhiskersLog = z.infer<typeof whiskersLogSchema>
export type WhiskersTrace = z.infer<typeof whiskersTraceSchema>
export type WhiskersSpan = z.infer<typeof whiskersSpanSchema>
export type WhiskersService = z.infer<typeof whiskersServiceSchema>
export type LogQuery = { service?: string; level?: 'error' | 'warn'; q?: string }
export type WhiskersEventDetail = z.infer<typeof whiskersEventDetailSchema>
