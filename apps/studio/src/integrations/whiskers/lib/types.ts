import type { z } from 'zod'
import type {
  ISSUE_BADGES,
  ISSUE_PERIODS,
  ISSUE_SORTS,
  ISSUE_STATUS_FILTERS,
  ISSUE_STATUSES,
  whiskersEventDetailSchema,
  whiskersFindingSchema,
  whiskersHotspotSchema,
  whiskersInstanceSchema,
  whiskersIssueDetailSchema,
  whiskersIssueEventListSchema,
  whiskersIssueEventSummarySchema,
  whiskersIssuePageSchema,
  whiskersIssueSchema,
  whiskersLogPatternSchema,
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
export type WhiskersIssuePage = z.infer<typeof whiskersIssuePageSchema>
export type WhiskersIssueDetail = z.infer<typeof whiskersIssueDetailSchema>
export type WhiskersIssueEventSummary = z.infer<typeof whiskersIssueEventSummarySchema>
export type WhiskersIssueEventList = z.infer<typeof whiskersIssueEventListSchema>
export type IssueStatus = (typeof ISSUE_STATUSES)[number]
export type IssueStatusFilter = (typeof ISSUE_STATUS_FILTERS)[number]
export type IssueBadge = (typeof ISSUE_BADGES)[number]
export type IssueSort = (typeof ISSUE_SORTS)[number]
export type IssuePeriod = (typeof ISSUE_PERIODS)[number]
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
/** Project ids to read from; undefined reads every project, empty reads none. */
export type ProjectScope = string[] | undefined
export type LogQuery = {
  projectIds?: ProjectScope
  service?: string
  level?: 'error' | 'warn'
  q?: string
}
/** `ids` narrows to known issues (studio's assignee filter); an empty list reads none. */
export type IssueListParams = {
  projectIds?: ProjectScope
  status: IssueStatusFilter
  environment?: string
  release?: string
  q?: string
  sort: IssueSort
  ids?: string[]
  limit?: number
}
export type WhiskersEventDetail = z.infer<typeof whiskersEventDetailSchema>
export type WhiskersLogPattern = z.infer<typeof whiskersLogPatternSchema>
