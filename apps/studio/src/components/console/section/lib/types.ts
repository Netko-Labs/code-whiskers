import type {
  SectionAction,
  SectionCell,
  SectionDefinition,
  SectionForm,
  SectionFormResult,
  SectionRowAction,
  SectionTable,
  SectionView,
} from '../../shared/console-model'

export type SectionViewProps = {
  section: SectionView
  tab: number
}

export type SectionTableProps = {
  table: SectionTable
  minWidth: number
}

export type SectionCellProps = {
  cell: SectionCell
}

export type SectionHook = (tab: number) => SectionDefinition

export type SectionScreenProps = {
  section: SectionView
  tab: number
  useDefinition: SectionHook
}

export type SectionActionsProps = {
  actions: SectionAction[]
  sample: boolean
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
