import type { Tone } from '@/components/shared/status'
import type { FindingSeverity, FindingStatus, PullRequestVerdict, VerdictMeta } from './types'

export const SEVERITY_ORDER: FindingSeverity[] = ['critical', 'high', 'medium', 'low']

export const SEVERITY_RANK: Record<FindingSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const SEVERITY_TONE: Record<FindingSeverity, Tone> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'neutral',
}

export const VERDICT_META: Record<PullRequestVerdict, VerdictMeta> = {
  running: { label: 'Reviewing…', tone: 'info' },
  failed: { label: 'Failed', tone: 'error' },
  approved: { label: 'Approved', tone: 'resolved' },
  changes_requested: { label: 'Changes requested', tone: 'error' },
  commented: { label: 'Commented', tone: 'warning' },
}

export const VERDICT_ORDER: PullRequestVerdict[] = [
  'changes_requested',
  'commented',
  'approved',
  'running',
  'failed',
]

export const FINDING_STATUS_LABEL: Record<FindingStatus, string> = {
  open: 'Open',
  dismissed: 'Dismissed',
  resolved: 'Resolved',
  outdated: 'Outdated',
}

export const FINDING_STATUS_HINT: Record<FindingStatus, string> = {
  open: 'Reported on this push',
  dismissed: 'Dismissed in CodeWhiskers; the reviewer stops raising it',
  resolved: 'A later full review no longer reports it',
  outdated: 'Later pushes were read as deltas and did not report it again',
}

export const EMPTY_COUNTS = { critical: 0, high: 0, medium: 0, low: 0 } as const

export const PARTIAL_PATTERN = /^Partial review — (\d+) of (\d+) sections/

/** Mirrors the worker's matcher loosely: a model rewords the same finding on every push. */
export const SAME_TITLE = 0.5
export const NEARBY_TITLE = 0.3
export const LINE_WINDOW = 6

export const TITLE_STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'into',
  'when',
  'can',
  'not',
  'are',
  'but',
  'its',
  'may',
  'will',
  'than',
  'then',
  'only',
])
