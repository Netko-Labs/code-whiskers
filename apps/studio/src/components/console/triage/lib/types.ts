import type { Tone } from '@/components/shared/status'
import type { AlertRule, Member } from '@/integrations/studio-api'
import type { WhiskersFinding } from '@/integrations/whiskers'
import type {
  ConsoleItem,
  TriageBucket,
  TriageFilter,
  TriageStatus,
} from '../../shared/console-model'

export type TriageBanner = {
  message: string
  meta: string
  tone: Tone
}

/** e and s on a review or log pattern; issues and alerts bring their own actions. */
export type DetailActions = {
  done: () => void
  snooze: () => void
  toggleFinding: (finding: WhiskersFinding, isDismissed: boolean) => void
  assignTo: (member: Member | null) => void
  postComment: () => void
}

export type RecencyGroup = 'today' | 'week' | 'earlier'

export type TriageRowEntry = {
  item: ConsoleItem
  isLeaving: boolean
}

export type TriageGroup = {
  key: RecencyGroup
  label: string
  rows: TriageRowEntry[]
}

export type LeavingRow = {
  item: ConsoleItem
  index: number
}

/** Where the requested row was last seen in the list. */
export type SelectionAnchor = {
  id: string
  index: number
}

export type TriageItemsResult = {
  items: ConsoleItem[]
  selected: ConsoleItem | undefined
  unreachable: boolean
  isLoading: boolean
}

export type TriageViewProps = {
  bucket: TriageBucket
  filter: TriageFilter
  selectedId: string | undefined
}

export type TriageListProps = {
  bucket: TriageBucket
  filter: TriageFilter
  items: ConsoleItem[]
  selectedId: string
  isLoading: boolean
  isUnreachable: boolean
}

export type TriageListEmptyProps = {
  bucket: TriageBucket
  isFiltered: boolean
  isUnreachable: boolean
}

export type TriageListHeaderProps = {
  bucket: TriageBucket
  filter: TriageFilter
  count: number
  query: string
  onQuery: (query: string) => void
}

export type TriageGroupListProps = {
  bucket: TriageBucket
  groups: TriageGroup[]
  selectedId: string
}

export type TriageRowProps = {
  bucket: TriageBucket
  entry: TriageRowEntry
  isSelected: boolean
}

export type TriageDetailProps = {
  item: ConsoleItem
}

export type DetailPaneProps = {
  item: ConsoleItem
  status: TriageStatus
  actions: DetailActions
}

export type DetailHeaderProps = DetailPaneProps & {
  banner: TriageBanner | null
}

export type ItemThreadProps = {
  item: ConsoleItem
  onPost: () => void
}

export type AlertDetailProps = {
  rule: AlertRule
}

export type AlertActions = {
  mute: () => void
}

export type { TriageStatus }
