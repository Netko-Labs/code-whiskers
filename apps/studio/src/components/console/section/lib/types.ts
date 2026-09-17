import type { SectionCell, SectionTable, SectionView } from '../../shared/console-model'

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
