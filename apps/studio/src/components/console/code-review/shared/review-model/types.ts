import type { Tone } from '@/components/shared/status'
import type { WhiskersFinding, WhiskersReview } from '@/integrations/whiskers'

export type FindingSeverity = WhiskersFinding['severity']
export type SeverityCounts = WhiskersReview['findingsBySeverity']

export type PullRequestVerdict =
  | 'running'
  | 'failed'
  | 'approved'
  | 'changes_requested'
  | 'commented'

export type VerdictMeta = {
  label: string
  tone: Tone
}

/** One pull request, read from its newest push; findings come from the newest completed one. */
export type PullRequestSummary = {
  key: string
  slug: string
  owner: string
  repo: string
  prNumber: number
  title: string | null
  author: string | null
  latest: WhiskersReview
  settled: WhiskersReview | undefined
  verdict: PullRequestVerdict
  counts: SeverityCounts
  findingCount: number
  pushes: number
  lastActivity: Date
}

export type FindingStatus = 'open' | 'dismissed' | 'resolved' | 'outdated'

/** `reportedBy` raised it last; `settledBy` stopped reporting it (resolved and outdated only). */
export type ReviewedFinding = {
  finding: WhiskersFinding
  status: FindingStatus
  reportedBy: WhiskersReview
  settledBy: WhiskersReview | null
}

export type FindingClaim = Pick<WhiskersFinding, 'file' | 'line' | 'title'>

export type FileGroup = {
  file: string
  findings: ReviewedFinding[]
  worst: FindingSeverity
}

/** A partial review: `skipped` of `total` diff sections could not be read. */
export type PushCoverage = {
  skipped: number
  total: number
}
