import type { CatExpressionName } from '@code-whiskers/ui/brand'
import type { ReactNode } from 'react'

export type EmptyStateSize = 'page' | 'inline'

export type EmptyStateProps = {
  title: string
  description?: ReactNode
  expression?: CatExpressionName
  /** Replaces the cat, e.g. a platform mark; keep it monochrome. */
  illustration?: ReactNode
  /** The one primary next step: a solid button or link. */
  action?: ReactNode
  /** A quieter link, e.g. docs or "send a test event". */
  secondary?: ReactNode
  size?: EmptyStateSize
  className?: string
  children?: ReactNode
}

export type ErrorStateProps = {
  title?: string
  description?: ReactNode
  onRetry?: () => void
  size?: EmptyStateSize
  className?: string
}
