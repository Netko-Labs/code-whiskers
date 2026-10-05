import type { ReactNode } from 'react'

export type SegmentValue = string | number

export type SegmentOption<T extends SegmentValue> = {
  value: T
  label: string
  icon?: ReactNode
}

export type SegmentedProps<T extends SegmentValue> = {
  label: string
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}
