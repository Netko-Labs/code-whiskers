import type { ReactNode } from 'react'
import type { Tone } from '@/components/shared/status'

export type NumberFormat = (value: number) => string

export type SparklineProps = {
  values: number[]
  width?: number
  height?: number
  tone?: Tone
  variant?: 'line' | 'bars'
  /** Read out instead of the drawing, e.g. "Events, last 24 hours". */
  label?: string
  className?: string
}

export type SparkLinePathsProps = {
  values: number[]
  width: number
  height: number
}

export type SparklineGeometry = {
  line: string
  area: string
}

export type SparkBar = {
  x: number
  y: number
  width: number
  height: number
}

export type CountUpProps = {
  value: number
  format?: NumberFormat
  className?: string
}

export type StatDelta = {
  label: string
  tone: Tone
}

export type StatCardProps = {
  label: string
  value: number | string
  format?: NumberFormat
  hint?: ReactNode
  delta?: StatDelta
  trend?: number[]
  tone?: Tone
  isLoading?: boolean
  className?: string
}

export type StatCardSkeletonProps = {
  className?: string
}

export type StatGridProps = {
  children: ReactNode
  className?: string
}
