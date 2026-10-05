import type { AriaAttributes, ReactElement, ReactNode } from 'react'
import type { Tone } from '@/components/shared/status'

export type RowDensity = 'default' | 'compact' | 'auto'

/** -1/1 step; `first`/`last` jump. */
export type RovingMove = -1 | 1 | 'first' | 'last'

export type DataListProps = {
  children: ReactNode
  label: string
  /** Rows stagger in on mount; turn off for lists that re-key on every keystroke. */
  isAnimated?: boolean
  isDivided?: boolean
  className?: string
}

export type DataRowRenderProps = {
  className?: string
  children?: ReactNode
  'data-slot'?: string
  'data-selected'?: string
  'aria-current'?: AriaAttributes['aria-current']
}

export type DataRowProps = {
  /** The interactive element the row becomes, e.g. `<Link to=… />` or `<button type="button" />`. */
  render?: ReactElement<DataRowRenderProps>
  isSelected?: boolean
  /** A 1px severity rule on the left edge; never a filled row. */
  tone?: Tone
  density?: RowDensity
  className?: string
  children: ReactNode
}

export type DataRowPartProps = {
  children?: ReactNode
  className?: string
}

export type DataGroupHeaderProps = {
  label: ReactNode
  count?: number
  isCollapsed?: boolean
  onToggle?: () => void
  actions?: ReactNode
  className?: string
}

export type DataListSkeletonProps = {
  rows?: number
  density?: RowDensity
  className?: string
}
