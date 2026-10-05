import type { FindingStatus } from '../../shared/review-model'

export const STATUS_TABS: FindingStatus[] = ['open', 'dismissed', 'resolved', 'outdated']

export const DISMISS_NOTE = 'dismissed in the CodeWhiskers console'

export const MISSING_REVIEW =
  'Whiskers has no review with this id. It may belong to a pull request that was deleted.'

export const FIX_HINT = 'Reply @code-whiskers fix on the inline comment and Whiskers pushes it'
