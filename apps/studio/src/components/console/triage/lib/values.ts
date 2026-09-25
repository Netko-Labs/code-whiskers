import type { TriageBucket, TriageFilter } from '../../shared/console-model'

export const TRIAGE_FILTERS: { value: TriageFilter; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'errors', label: 'Errors' },
  { value: 'logs', label: 'Logs' },
]

export const TRIAGE_BUCKETS: { value: TriageBucket; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'snoozed', label: 'Snoozed' },
]

export const ERROR_TABS = [
  { value: 'stack', label: 'Stack trace', meta: 'most recent call first' },
  { value: 'crumbs', label: 'Breadcrumbs', meta: 'leading up to it' },
  { value: 'logs', label: 'Log context', meta: 'same trace' },
  { value: 'tags', label: 'Tags', meta: 'issue tags' },
] as const

export const SNOOZE_MS = 24 * 60 * 60 * 1000
export const DRAFT_HINT = 'Visible to your team · ⌘↵ to post'
export const SAMPLE_ACTION_NOTE = 'Sample data — connect a repository to act on real items'
export const DISMISS_NOTE = 'dismissed in the CodeWhiskers console'
