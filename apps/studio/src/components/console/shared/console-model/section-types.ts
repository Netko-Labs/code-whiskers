import type { CatExpressionName } from '@code-whiskers/ui/brand'
import type { IssueSort } from '@/integrations/whiskers'
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
  onSelect?: () => void
}

export type SectionRowAction = {
  label: string
  onSelect?: () => void
  form?: SectionForm
  tone?: 'danger'
}

export type SectionFilters = {
  q?: string
  service?: string
  scope?: string
  environment?: string
  release?: string
  sort?: IssueSort
  /** `1` keeps only issues assigned to the viewer. */
  mine?: '1'
  /** Comma-separated project ids: the releases list's project facet. */
  project?: string
}

export type SectionRowLink =
  | { kind: 'triage'; itemId: string }
  | { kind: 'external'; href: string }
  | { kind: 'section'; section: SectionView; tab?: number; filters?: SectionFilters }
  | { kind: 'project-setup' }
  | { kind: 'project'; projectId: string }

export type SectionTable = {
  grid: string
  columns: SectionColumn[]
  rows: SectionCell[][]
  rowLinks?: (SectionRowLink | null)[]
  rowActions?: SectionRowAction[][]
  footer: string
}

/** `href` is a console path or an absolute URL (opened in a new tab). */
export type SectionEmptyAction = {
  label: string
  href: string
}

export type SectionEmpty = {
  title: string
  description: string
  expression?: CatExpressionName
  action?: SectionEmptyAction
}

export type SectionDefinition = {
  title: string
  subtitle: string
  actions: SectionAction[]
  stats: SectionStat[]
  tabs: string[]
  /** What the table says when it has no rows at all; filtered-to-nothing says "no matches". */
  empty?: SectionEmpty
  /** The primary source has not answered yet; the table shows a skeleton. */
  isLoading?: boolean
  /** One line that changes what the reader should do, e.g. why a scoped table is empty. */
  note?: string | null
  /** Reads the console scope; shows the repository picker next to the tabs. */
  isScoped?: boolean
  /** Shows a search box bound to the `q` filter. */
  searchPlaceholder?: string
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
