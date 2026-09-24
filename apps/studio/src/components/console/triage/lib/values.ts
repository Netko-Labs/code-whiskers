import type { TriageFilter } from '../../shared/console-model'

export const TRIAGE_FILTERS: { value: TriageFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'errors', label: 'Errors' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'logs', label: 'Logs' },
]

export const ERROR_TABS = [
  { value: 'stack', label: 'Stack trace', meta: 'most recent call first' },
  { value: 'crumbs', label: 'Breadcrumbs', meta: 'leading up to it' },
  { value: 'logs', label: 'Log context', meta: 'same trace' },
  { value: 'tags', label: 'Tags', meta: 'issue tags' },
] as const

export const SNOOZE_MS = 24 * 60 * 60 * 1000
export const DRAFT_HINT = 'Visible to everyone on this repository · ⌘↵ to post'
export const KEYBOARD_HINT = 'j / k'
export const LIVE_NOTE = 'Live — refreshes when you return to this tab'
export const SAMPLE_ACTION_NOTE = 'Sample data — connect a repository to act on real items'
export const DISMISS_NOTE = 'dismissed in the CodeWhiskers console'
