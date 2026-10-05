import type { AlertTrigger } from '@/integrations/alerts-api'
import type { TriageBucket, TriageFilter } from '../../shared/console-model'
import type { RecencyGroup } from './types'

export const TRIAGE_FILTERS: { value: TriageFilter; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'errors', label: 'Errors' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'logs', label: 'Logs' },
  { value: 'alerts', label: 'Alerts' },
]

export const RECENCY_LABELS: Record<RecencyGroup, string> = {
  today: 'Today',
  week: 'This week',
  earlier: 'Earlier',
}

export const RECENCY_ORDER: RecencyGroup[] = ['today', 'week', 'earlier']

/** Reviews and log patterns snooze; issues archive with their own conditions instead. */
export const SNOOZE_MS = 24 * 60 * 60 * 1000
/** How long a triaged row takes to fold away; matches `duration-base`. */
export const LEAVE_MS = 180
export const DISMISS_NOTE = 'dismissed in the CodeWhiskers console'
export const EMPTY_BUCKET: Record<TriageBucket, { title: string; description: string }> = {
  inbox: {
    title: 'Inbox zero',
    description:
      'New, regressed and spiking issues, blocking reviews and firing alerts land here as they happen.',
  },
  assigned: {
    title: 'Nothing assigned to you',
    description: 'Items you or a teammate assign to you show up here until they are done.',
  },
  snoozed: {
    title: 'Nothing snoozed',
    description: 'Snooze a review or log pattern with s; it comes back when the snooze ends.',
  },
}
export const NO_MATCHES = 'Nothing here matches that filter.'
export const UNREACHABLE_TITLE = 'Whiskers is not answering'
export const UNREACHABLE_DESCRIPTION =
  'The worker behind errors, reviews and logs did not respond. Check WHISKERS_URL and the worker logs.'
export const NOTHING_TO_DECIDE = 'Nothing to decide on this item yet'
export const NO_COMMENTS_NOTE = 'Comments open once this item is tracked.'

export const ALERT_KIND_LABEL: Record<AlertTrigger, string> = {
  new_issue: 'New issue',
  issue_regressed: 'Regression',
  issue_frequency: 'Issue frequency',
  error_rate: 'Project error volume',
  review_failed: 'Review failed',
  blocking_review: 'Blocking review',
}
