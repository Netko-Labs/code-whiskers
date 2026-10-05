import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'

export type ToolbarProps = {
  children: ReactNode
  className?: string
}

export type ToolbarSearchProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  /** A single key that focuses the field from anywhere on the page; `null` turns it off. */
  focusKey?: string | null
  className?: string
}

export type FilterChipItem = {
  key: string
  label: string
  value: string
  onRemove: () => void
}

export type FilterChipsProps = {
  chips: FilterChipItem[]
  onClearAll?: () => void
  className?: string
}

export type FilterChipProps = Omit<FilterChipItem, 'key'>

export type MenuOption<Value extends string = string> = {
  value: Value
  label: string
  count?: number
}

export type FilterMenuProps = {
  label: string
  icon?: Icon
  options: MenuOption[]
  selected: string[]
  onToggle: (value: string) => void
  className?: string
}

export type SortMenuProps<Value extends string> = {
  value: Value
  options: MenuOption<Value>[]
  onValueChange: (value: Value) => void
  className?: string
}
