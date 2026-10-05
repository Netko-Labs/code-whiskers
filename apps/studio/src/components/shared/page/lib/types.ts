import type { ReactNode } from 'react'

export type PageWidth = 'full' | 'default' | 'narrow'

export type PageProps = {
  children: ReactNode
  className?: string
}

export type PageBodyProps = {
  children: ReactNode
  width?: PageWidth
  className?: string
}

export type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  /** Evidence under the title: ids, counts, badges. */
  meta?: ReactNode
  actions?: ReactNode
  /** A `PageTabs` row, drawn on the header's bottom hairline. */
  tabs?: ReactNode
  className?: string
}

export type PageTabItem = {
  key: string
  label: string
  count?: number
  isActive: boolean
  onSelect: () => void
}

export type PageTabsProps = {
  items: PageTabItem[]
  label: string
  className?: string
}

export type PanelProps = {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  /** Drops the body padding for lists and tables that run edge to edge. */
  isFlush?: boolean
  className?: string
}

export type SectionProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export type KeyValueListProps = {
  children: ReactNode
  className?: string
}

export type KeyValueProps = {
  label: ReactNode
  children: ReactNode
  isMono?: boolean
  className?: string
}

export type SettingRowProps = {
  label: ReactNode
  description?: ReactNode
  /** Makes the label a <label> for the control on the right. */
  htmlFor?: string
  children?: ReactNode
  className?: string
}

export type SkeletonRowsProps = {
  rows?: number
  className?: string
}
