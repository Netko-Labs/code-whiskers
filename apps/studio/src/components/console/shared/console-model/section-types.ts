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

export type SectionFieldOption = {
  value: string
  label: string
}

export type SectionField = {
  name: string
  label: string
  kind: 'text' | 'textarea' | 'select'
  options?: SectionFieldOption[]
  placeholder?: string
  defaultValue?: string
  hint?: string
  isRequired?: boolean
}

/** `reveal` is shown once with a copy button — for secrets that are never readable again. */
export type SectionFormResult = { message?: string; reveal?: string } | undefined

export type SectionForm = {
  title: string
  description?: string
  submitLabel: string
  fields: SectionField[]
  onSubmit: (values: Record<string, string>) => Promise<SectionFormResult>
}

export type SectionAction = {
  label: string
  variant: 'outline' | 'solid'
  /** Neither `href` nor `form` means the action has nothing behind it yet; it renders disabled. */
  href?: string
  form?: SectionForm
}

export type SectionRowAction = {
  label: string
  onSelect: () => void
  tone?: 'danger'
}

export type SectionRowLink = { kind: 'triage'; itemId: string } | { kind: 'external'; href: string }

export type SectionTable = {
  grid: string
  columns: SectionColumn[]
  rows: SectionCell[][]
  rowLinks?: (SectionRowLink | null)[]
  rowActions?: SectionRowAction[][]
  footer: string
}

export type SectionDefinition = {
  title: string
  subtitle: string
  actions: SectionAction[]
  stats: SectionStat[]
  tabs: string[]
  /** A fixture shown until the real source has rows; the view labels it. */
  sample?: boolean
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
  | 'instance'
