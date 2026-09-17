import type { ConsoleSeverity, ConsoleTone } from './types'

export type SectionAlign = 'start' | 'end'
export type PillTone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral'

export type SectionTextCell = {
  kind: 'text'
  text: string
  mono?: boolean
  strong?: boolean
  tone?: ConsoleTone
  dot?: ConsoleSeverity
  wrap?: boolean
  align?: SectionAlign
}

export type SectionPillCell = {
  kind: 'pill'
  text: string
  tone: PillTone
  align?: SectionAlign
}

export type SectionBarCell = {
  kind: 'bar'
  percent: number
  tone: PillTone
  note?: string
  align?: SectionAlign
}

export type SectionCell = SectionTextCell | SectionPillCell | SectionBarCell

export type SectionColumn = {
  label: string
  align?: SectionAlign
}

export type SectionStat = {
  label: string
  value: string
  note: string
}

export type SectionAction = {
  label: string
  variant: 'outline' | 'solid'
}

export type SectionTable = {
  grid: string
  columns: SectionColumn[]
  rows: SectionCell[][]
  footer: string
}

export type SectionDefinition = {
  title: string
  subtitle: string
  actions: SectionAction[]
  stats: SectionStat[]
  tabs: string[]
  /** Tab-dependent sections return a different table per tab; the rest ignore the index. */
  table: SectionTable | ((tab: number) => SectionTable)
}

export type SectionView =
  | 'pull-requests'
  | 'repositories'
  | 'codebase-map'
  | 'review-rules'
  | 'issues'
  | 'regressions'
  | 'releases'
  | 'alert-rules'
  | 'live-logs'
  | 'traces'
  | 'services'
  | 'saved-queries'
  | 'members'
  | 'integrations'
  | 'api-keys'
  | 'usage'
  | 'billing'
