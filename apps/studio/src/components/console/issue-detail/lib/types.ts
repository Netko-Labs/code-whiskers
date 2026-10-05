import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import type { Member, ResolveMode, TriageActivity, TriageItemRef } from '@/integrations/studio-api'
import type {
  IssuePeriod,
  WhiskersEventDetail,
  WhiskersIssue,
  WhiskersIssueDetail,
  WhiskersIssueEventList,
} from '@/integrations/whiskers'
import type { ConsoleTone } from '../../shared/console-model'
import type { ArchiveChoice, IssueBanner } from '../../shared/issue-lifecycle'

export type IssueDetailProps = {
  issueId: string
  /** The row the list already has, so the header paints before the detail arrives. */
  seed?: WhiskersIssue
  /** Shown above the evidence, e.g. Whiskers' read on the issue. */
  lead?: ReactNode
}

export type IssuePageProps = {
  issueId: string
}

export type IssueDetailState = {
  issue: WhiskersIssue | undefined
  detail: WhiskersIssueDetail | undefined
  isMissing: boolean
}

export type IssueEventState = {
  event: WhiskersEventDetail | undefined
  isLoading: boolean
  isMissing: boolean
}

export type IssueEventsState = {
  list: WhiskersIssueEventList | undefined
  isLoading: boolean
}

export type IssueActionsState = {
  assigneeUserId: string | null
  isArchiveOpen: boolean
  setArchiveOpen: (isOpen: boolean) => void
  isAssignOpen: boolean
  setAssignOpen: (isOpen: boolean) => void
  resolve: (mode: ResolveMode) => void
  archive: (choice: ArchiveChoice) => void
  unresolve: () => void
  assign: (member: Member | null) => void
}

export type IssueActivityState = {
  ref: TriageItemRef
  entries: TriageActivity[]
  draft: string
  setDraft: (draft: string) => void
  post: () => void
}

export type IssueHeaderProps = {
  issue: WhiskersIssue
}

export type IssueActionsProps = {
  issue: WhiskersIssue
  actions: IssueActionsState
}

export type IssueBannerProps = {
  banner: IssueBanner
  actionLabel: string
  onAction: () => void
}

export type IssueStatsProps = {
  issue: WhiskersIssue
}

export type IssueHistogramProps = {
  detail: WhiskersIssueDetail | undefined
  period: IssuePeriod
  onPeriod: (period: IssuePeriod) => void
}

export type IssueEventProps = {
  issue: WhiskersIssue
  tags: WhiskersIssueDetail['tags']
}

export type IssueEventNavProps = {
  issue: WhiskersIssue
  event: WhiskersEventDetail | undefined
  onPick: (eventId: string) => void
}

export type IssueEventPickerProps = {
  issue: WhiskersIssue
  currentId: string | null
  onPick: (eventId: string) => void
}

export type IssueSectionProps = {
  title: string
  meta?: string
  children: ReactNode
}

export type IssueStackProps = {
  event: WhiskersEventDetail
}

export type IssueFrameProps = {
  frame: WhiskersEventDetail['frames'][number]
  isCulprit: boolean
}

export type IssueVendorFramesProps = {
  frames: WhiskersEventDetail['frames']
}

export type FrameGroup =
  | { kind: 'app'; frame: WhiskersEventDetail['frames'][number]; index: number }
  | { kind: 'vendor'; frames: WhiskersEventDetail['frames']; index: number }

export type IssueBreadcrumbsProps = {
  crumbs: WhiskersEventDetail['breadcrumbs']
}

export type CrumbView = {
  icon: Icon
  label: string
  tone: ConsoleTone
  time: string
  message: string
}

export type IssueTagsProps = {
  tags: WhiskersIssueDetail['tags']
}

export type TagShare = {
  value: string
  count: number
  percent: number
}

export type IssueRailProps = {
  issue: WhiskersIssue
  detail: WhiskersIssueDetail | undefined
}

export type IssueFacetListProps = {
  title: string
  rows: { name: string; count: number; note?: string }[]
  isMono?: boolean
}

export type IssueActivityProps = {
  issue: WhiskersIssue
}

export type IssueActivityEntryProps = {
  view: ActivityView
}

export type ActivityView = {
  id: string
  who: string
  image: string | null
  isSystem: boolean
  text: string
  body: string | null
  at: Date
}
