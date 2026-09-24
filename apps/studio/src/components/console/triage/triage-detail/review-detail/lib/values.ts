import type { FindingSeverity, OutcomeTone } from './types'

export const SEVERITY_ORDER: FindingSeverity[] = ['critical', 'high', 'medium', 'low']

export const SEVERITY_RANK: Record<FindingSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const SEVERITY_CHIP: Record<FindingSeverity, string> = {
  critical: 'bg-severity-error/12 text-severity-error-ink',
  high: 'bg-severity-error/10 text-severity-error-ink',
  medium: 'bg-severity-warning/12 text-severity-warning-ink',
  low: 'bg-muted text-muted-foreground',
}

export const SEVERITY_DOT: Record<FindingSeverity, string> = {
  critical: 'bg-severity-error',
  high: 'bg-severity-error',
  medium: 'bg-severity-warning',
  low: 'bg-faint',
}

export const OUTCOME_SURFACE: Record<OutcomeTone, string> = {
  ok: 'border-severity-resolved/35 bg-severity-resolved/[0.07] text-severity-resolved-ink',
  warn: 'border-severity-warning/35 bg-severity-warning/[0.07] text-severity-warning-ink',
  bad: 'border-severity-error/35 bg-severity-error/[0.07] text-severity-error-ink',
  info: 'border-severity-info/35 bg-severity-info/[0.07] text-severity-info-ink',
}

export const VERDICT_LABEL = {
  approve: 'approved',
  request_changes: 'changes requested',
  comment: 'commented',
} as const

export const READ_PREVIEW_BULLETS = 4
export const FIX_HINT = 'Reply @code-whiskers fix on the inline comment and Whiskers pushes it'
