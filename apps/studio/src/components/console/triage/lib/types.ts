import type { ConsoleItem, TriageBucket, TriageFilter } from '../../shared/console-model'

export type TriageStatus = {
  resolved: boolean
  approved: boolean
  tracked: boolean
  dismissed: boolean
  done: boolean
}

export type TriageBanner = {
  message: string
  meta: string
  tone: 'ok' | 'info' | 'warn'
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
  sampleNote: string
}

export type TriageRowProps = {
  bucket: TriageBucket
  item: ConsoleItem
  active: boolean
}

export type TriageDetailProps = {
  item: ConsoleItem
}

export type DetailPaneProps = {
  item: ConsoleItem
  status: TriageStatus
  actions: import('./hooks/use-detail-actions').DetailActions
}

export type AssignMenuProps = {
  onAssign: (name: string) => void
}

export type DetailBannerProps = {
  banner: TriageBanner
}
