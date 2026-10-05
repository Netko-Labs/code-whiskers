import type { Member } from '@/integrations/studio-api'
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
  tone: 'ok' | 'info' | 'warn'
}

export type DetailActions = {
  onPrimary: () => void
  onSecondary: () => void
  onEvidence: () => void
  toggleFinding: (finding: WhiskersFinding, isDismissed: boolean) => void
  openFix: () => void
  closeFix: () => void
  commitFix: () => void
  assignTo: (member: Member | null) => void
  postComment: () => void
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
}

export type TriageRowProps = {
  bucket: TriageBucket
  item: ConsoleItem
  active: boolean
}

export type TriageRowIssueProps = {
  item: ConsoleItem
  owner: string | undefined
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

export type { TriageStatus }
