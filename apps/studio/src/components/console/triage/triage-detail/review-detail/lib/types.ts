import type { ReactNode } from 'react'
import type { WhiskersFinding, WhiskersReview } from '@/integrations/whiskers'
import type { ConsoleItem } from '../../../../shared/console-model'
import type { DetailActions } from '../../../lib'

export type FindingSeverity = WhiskersFinding['severity']
export type SeverityFilter = FindingSeverity | 'all'
export type OutcomeTone = 'ok' | 'warn' | 'bad' | 'info'

export type FileGroup = {
  file: string
  findings: WhiskersFinding[]
  worst: FindingSeverity
}

export type ReviewOutcome = {
  tone: OutcomeTone
  title: string
  note: string
}

export type ReviewDetailData = {
  review: WhiskersReview | undefined
  findings: WhiskersFinding[]
  pushes: WhiskersReview[]
  isLoading: boolean
  isError: boolean
  rerun: () => void
}

export type FindingDecisions = {
  open: WhiskersFinding[]
  dismissedCount: number
  isDismissed: (finding: WhiskersFinding) => boolean
}

export type ReviewDetailProps = {
  item: ConsoleItem
  actions: DetailActions
}

export type ReviewReadProps = {
  item: ConsoleItem
}

export type ReviewFindingsProps = {
  item: ConsoleItem
  detail: ReviewDetailData
  decisions: FindingDecisions
  actions: DetailActions
}

export type ReviewFileGroupProps = {
  group: FileGroup
  fileUrl: string | undefined
  lineUrl: (finding: WhiskersFinding) => string | undefined
  isDismissed: (finding: WhiskersFinding) => boolean
  onToggle: (finding: WhiskersFinding, isDismissed: boolean) => void
}

export type FindingCardProps = {
  finding: WhiskersFinding
  isDismissed: boolean
  url: string | undefined
  onToggle: () => void
}

export type ReviewSidebarProps = {
  item: ConsoleItem
  detail: ReviewDetailData
  open: WhiskersFinding[]
}

export type ReviewOutcomeProps = {
  review: WhiskersReview | undefined
  open: WhiskersFinding[]
  className: string
}

export type ReviewPushesProps = {
  pushes: WhiskersReview[]
  currentId: string | undefined
}

export type SidebarRow = [label: string, value: ReactNode]
