import type {
  SectionAction,
  SectionCell,
  SectionDefinition,
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
