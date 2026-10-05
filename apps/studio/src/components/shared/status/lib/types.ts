import type { ReactNode } from 'react'

/** Brand severity names; `neutral` is the absence of a signal, not a fifth color. */
export type Tone = 'error' | 'warning' | 'resolved' | 'info' | 'neutral'

export type SeverityDotProps = {
  tone: Tone
  size?: 'sm' | 'md'
  isPulsing?: boolean
  /** Without a label the dot is decorative and hidden from assistive tech. */
  label?: string
  className?: string
}

export type StatusBadgeProps = {
  tone: Tone
  children: ReactNode
  className?: string
}

export type LiveDotProps = {
  isLive?: boolean
  label?: string
  className?: string
}
