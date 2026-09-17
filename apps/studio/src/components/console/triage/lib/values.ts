import type { TriageFilter } from '../../shared/console-model'

export const TRIAGE_FILTERS: { value: TriageFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'errors', label: 'Errors' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'logs', label: 'Logs' },
]

export const ERROR_TABS = [
  { value: 'stack', label: 'Stack trace', meta: 'most recent call first' },
  { value: 'crumbs', label: 'Breadcrumbs', meta: 'last 5 events' },
  { value: 'logs', label: 'Log context', meta: 'surrounding lines' },
  { value: 'tags', label: 'Tags', meta: 'issue tags' },
] as const

export const HIDDEN_FRAMES_NOTE = '3 frames hidden (node_modules)'
export const DRAFT_HINT = 'Markdown supported · ⌘↵ to post'
export const KEYBOARD_HINT = 'j / k'
