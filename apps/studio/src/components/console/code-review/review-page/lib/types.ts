import type { WhiskersFinding, WhiskersReview } from '@/integrations/whiskers'
import type {
  FileGroup,
  FindingSeverity,
  FindingStatus,
  PushCoverage,
  ReviewedFinding,
} from '../../shared/review-model'

export type TimelinePush = {
  push: WhiskersReview
  coverage: PushCoverage | null
  newCount: number
  isSelected: boolean
}

export type ReviewPageData = {
  slug: string
  selected: WhiskersReview
  latest: WhiskersReview
  basis: WhiskersReview | undefined
  findings: ReviewedFinding[]
  timeline: TimelinePush[]
}

export type ReviewPageState = {
  data: ReviewPageData | null
  isLoading: boolean
  isMissing: boolean
  isError: boolean
  refetch: () => void
}

export type ReviewActions = {
  rerun: () => void
  toggleFinding: (finding: WhiskersFinding, isDismissed: boolean) => void
}

export type StatusFilter = FindingStatus | 'all'
export type SeverityFilter = FindingSeverity | 'all'

export type ReviewPageProps = {
  reviewId: string
}

export type ReviewViewProps = {
  data: ReviewPageData
  actions: ReviewActions
}

export type ReviewHeaderProps = ReviewViewProps

export type ReviewSummaryProps = {
  data: ReviewPageData
}

export type ReviewFindingsProps = ReviewViewProps

export type ReviewFileProps = {
  group: FileGroup
  slug: string
  sha: string
  onToggle: ReviewActions['toggleFinding']
}

export type ReviewFindingProps = {
  entry: ReviewedFinding
  lineUrl: string | undefined
  onToggle: () => void
}

export type ReviewTimelineProps = {
  timeline: TimelinePush[]
}

export type ReviewRailProps = {
  data: ReviewPageData
}

export type FindingFilterBarProps = {
  findings: ReviewedFinding[]
  status: StatusFilter
  severity: SeverityFilter
  onStatus: (status: StatusFilter) => void
  onSeverity: (severity: SeverityFilter) => void
}

export type SuggestionBlock = {
  code: string
  isBlock: boolean
}
