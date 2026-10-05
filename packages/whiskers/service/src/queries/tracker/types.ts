import type { ISSUE_BADGES, Issue, IssueListQuery } from '@code-whiskers/whiskers-domain'

export interface EventFrame {
  file: string
  function: string
  line: number | null
  column: number | null
  isInApp: boolean
  context: string | null
}

export interface EventCrumb {
  timestamp: string | null
  category: string
  level: string
  message: string
}

export interface EventLogLine {
  timestamp: Date
  level: string
  service: string
  message: string
}

export interface EventDetail {
  receivedAt: Date
  level: string
  message: string
  environment: string | null
  release: string | null
  traceId: string | null
  frames: EventFrame[]
  breadcrumbs: EventCrumb[]
  tags: Record<string, string>
  request: { method: string | null; url: string | null } | null
  logs: EventLogLine[]
}

export interface IssueEventDetail extends EventDetail {
  /** Our row id — what `/v1/issues/:id/events/:eventId` takes. */
  id: string
  /** The SDK's own event id. */
  eventId: string | null
  /** The next older event of the issue. */
  prevId: string | null
  /** The next newer event of the issue. */
  nextId: string | null
}

export type IssueBadge = (typeof ISSUE_BADGES)[number]

export interface Cursor {
  value: string | number
  id: string
}

export interface BadgeInput {
  firstSeen: Date
  status: string
  regressedAt: Date | null
  lastHourEvents: number
  previousWeekEvents: number
}

export interface IssueStats {
  trend: number[]
  lastHourEvents: number
  previousWeekEvents: number
}

export type IssueRow = Issue & {
  firstRelease: string | null
  badges: IssueBadge[]
  /** Daily event counts, oldest first, today last. */
  trend: number[]
}

export interface IssuePage {
  issues: IssueRow[]
  nextCursor: string | null
  total: number
}

export interface NamedCount {
  name: string
  count: number
}

export interface ReleaseCount extends NamedCount {
  firstSeen: Date
}

export interface TagDistribution {
  key: string
  values: { value: string; count: number }[]
}

export interface HistogramBucket {
  bucket: Date
  count: number
}

export interface IssueDetail {
  issue: IssueRow
  environments: NamedCount[]
  releases: ReleaseCount[]
  tags: TagDistribution[]
  histogram: HistogramBucket[]
}

export interface IssueEventSummary {
  id: string
  eventId: string | null
  receivedAt: Date
  level: string
  message: string
  environment: string | null
  release: string | null
}

export interface IssueEventPage {
  events: IssueEventSummary[]
  nextCursor: string | null
}

export interface IssueFilter {
  query: IssueListQuery
  projectIds?: string[]
  ids?: string[]
}
