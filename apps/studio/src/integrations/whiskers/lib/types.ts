import type { z } from 'zod'
import type {
  whiskersFindingSchema,
  whiskersHotspotSchema,
  whiskersIssueSchema,
  whiskersOverviewSchema,
  whiskersReviewDetailSchema,
  whiskersReviewSchema,
} from './schemas'

export type WhiskersOverview = z.infer<typeof whiskersOverviewSchema>
export type WhiskersIssue = z.infer<typeof whiskersIssueSchema>
export type WhiskersReview = z.infer<typeof whiskersReviewSchema>
export type WhiskersFinding = z.infer<typeof whiskersFindingSchema>
export type WhiskersReviewDetail = z.infer<typeof whiskersReviewDetailSchema>
export type WhiskersHotspot = z.infer<typeof whiskersHotspotSchema>
