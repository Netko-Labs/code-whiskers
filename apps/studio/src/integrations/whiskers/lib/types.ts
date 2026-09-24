import type { z } from 'zod'
import type {
  whiskersFindingSchema,
  whiskersHotspotSchema,
  whiskersInstanceSchema,
  whiskersIssueSchema,
  whiskersOverviewSchema,
  whiskersProjectSchema,
  whiskersReleaseSchema,
  whiskersReviewDetailSchema,
  whiskersReviewSchema,
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
