import type {
  SectionAction,
  SectionCell,
  SectionDefinition,
  SectionEmpty,
  SectionEmptyAction,
  SectionFilters,
  SectionForm,
  SectionFormResult,
  SectionRowAction,
  SectionTable,
  SectionView,
} from '../../shared/console-model'
import type { ConsoleScope } from '../../shared/console-scope'

/** Issues and Regressions are the issue list, not a generic table. */
export type IssueSectionView = Extract<SectionView, 'issues' | 'regressions'>
/** Code review has its own routes under `routes/console/`, not the section table. */
export type CodeReviewSectionView = Extract<
  SectionView,
  'pull-requests' | 'repositories' | 'codebase-map' | 'review-rules'
>
export type TableSectionView = Exclude<SectionView, IssueSectionView | CodeReviewSectionView>
export type SectionScreenView = IssueSectionView | TableSectionView

export type SectionViewProps = {
  section: SectionScreenView
  tab: number
  filters: SectionFilters
}

export type SectionTableProps = {
  table: SectionTable
  minWidth: number
  empty?: SectionEmpty
  isLoading?: boolean
}

export type SectionEmptyStateProps = {
  empty?: SectionEmpty
}

export type SectionLinkProps = {
  action: SectionEmptyAction
  className: string
}

export type SectionCellProps = {
  cell: SectionCell
}

export type SectionHook = (
  tab: number,
  filters: SectionFilters,
  scope: ConsoleScope,
) => SectionDefinition

export type SectionHeaderProps = {
  definition: Pick<SectionDefinition, 'title' | 'subtitle' | 'stats' | 'note' | 'actions'>
}

export type SectionToolbarProps = {
  section: SectionView
  tab: number
  filters: SectionFilters
  definition: SectionDefinition
}

export type SectionScreenProps = {
  section: TableSectionView
  tab: number
  filters: SectionFilters
  useDefinition: SectionHook
}

export type SectionSearchBoxProps = {
  section: SectionView
  tab: number
  filters: SectionFilters
  placeholder: string
}

export type SectionActionsProps = {
  actions: SectionAction[]
}

export type StoreRow = {
  table: string
  database: string
  bytes: number
  rows: string
  oldest: Date | null
}

export type SectionFormState = {
  values: Record<string, string>
  isPending: boolean
  error: string | null
  result: SectionFormResult
  setValue: (name: string, value: string) => void
  reset: () => void
  /** Resolves true when the dialog can close; a revealed secret keeps it open to be copied. */
  submit: () => Promise<boolean>
}

export type SectionFormDialogProps = {
  form: SectionForm
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export type SectionFormActionProps = {
  action: SectionAction
}

export type SectionRowActionsProps = {
  actions: SectionRowAction[]
}

export type SectionRowFormActionProps = {
  action: SectionRowAction
  className: string
}
