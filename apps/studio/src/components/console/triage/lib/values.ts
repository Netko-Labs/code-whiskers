import type { TriageFilter } from '../../shared/console-model'

export const TRIAGE_FILTERS: { value: TriageFilter; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'errors', label: 'Errors' },
  { value: 'logs', label: 'Logs' },
]

/** Reviews and log patterns snooze; issues archive with their own conditions instead. */
export const SNOOZE_MS = 24 * 60 * 60 * 1000
export const DISMISS_NOTE = 'dismissed in the CodeWhiskers console'
export const NO_EVENT_NOTE =
  'No ingested issue backs this error, so there is no stack trace or event history to show.'
