import type { FindingSeverity, OutcomeTone } from './types'

export const SEVERITY_ORDER: FindingSeverity[] = ['critical', 'high', 'medium', 'low']

export const SEVERITY_RANK: Record<FindingSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const SEVERITY_DOT: Record<FindingSeverity, string> = {
  critical: 'bg-severity-error',
  high: 'bg-severity-error',
  medium: 'bg-severity-warning',
  low: 'bg-faint',
}

export const OUTCOME_RULE: Record<OutcomeTone, string> = {
  ok: 'border-severity-resolved',
  warn: 'border-severity-warning',
  bad: 'border-severity-error',
  info: 'border-severity-info',
}

export const VERDICT_LABEL = {
  approve: 'approved',
  request_changes: 'changes requested',
  comment: 'commented',
} as const

export const READ_PREVIEW_BULLETS = 4
export const FIX_HINT = 'Reply @code-whiskers fix on the inline comment and Whiskers pushes it'
