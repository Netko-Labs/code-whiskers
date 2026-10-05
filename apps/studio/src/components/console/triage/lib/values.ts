import type { TriageBucket, TriageFilter } from '../../shared/console-model'

export const TRIAGE_FILTERS: { value: TriageFilter; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'errors', label: 'Errors' },
  { value: 'logs', label: 'Logs' },
]

/** Reviews and log patterns snooze; issues archive with their own conditions instead. */
export const SNOOZE_MS = 24 * 60 * 60 * 1000
export const DISMISS_NOTE = 'dismissed in the CodeWhiskers console'
export const EMPTY_BUCKET: Record<TriageBucket, { title: string; description: string }> = {
  inbox: {
    title: 'Inbox zero',
    description:
      'New errors, review findings and noisy log patterns land here as whiskers sees them.',
  },
  assigned: {
    title: 'Nothing assigned to you',
    description: 'Items you or a teammate assign to you show up here until they are done.',
  },
  snoozed: {
    title: 'Nothing snoozed',
    description: 'Snooze an item with s; it comes back to the inbox when the snooze ends.',
  },
}
export const UNREACHABLE_TITLE = 'Whiskers is not answering'
export const UNREACHABLE_DESCRIPTION =
  'The worker behind errors, reviews and logs did not respond. Check WHISKERS_URL and the worker logs.'
export const NOTHING_TO_DECIDE = 'Nothing to decide on this item yet'
export const NO_EVIDENCE_NOTE = 'No evidence is attached to this item'
export const FIX_UNAVAILABLE_NOTE = 'Committing a fix from here is not available yet'
export const NO_COMMENTS_NOTE = 'Comments open once this item is tracked.'
export const NO_EVENT_NOTE =
  'No ingested issue backs this error, so there is no stack trace or event history to show.'
