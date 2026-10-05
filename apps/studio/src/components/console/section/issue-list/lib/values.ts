import type { IssueTab, SortOption, StatusWords } from './types'

export const ISSUE_TABS: IssueTab[] = [
  { label: 'Unresolved', status: 'unresolved' },
  { label: 'Resolved', status: 'resolved' },
  { label: 'Archived', status: 'archived' },
  { label: 'All', status: 'all' },
]

export const SORT_OPTIONS: SortOption[] = [
  { value: 'last_seen', label: 'Last seen' },
  { value: 'first_seen', label: 'First seen' },
  { value: 'events', label: 'Events' },
  { value: 'users', label: 'Users' },
]

/** check · issue · project · trend · events · users · last seen · assignee */
export const ISSUE_GRID = '16px minmax(0,1fr) 120px 72px 64px 56px 64px 22px'
export const ISSUE_LIST_MIN_WIDTH = 920

export const ISSUE_COLUMNS = [
  { label: 'Project', align: 'start' },
  { label: '14 days', align: 'start' },
  { label: 'Events', align: 'end' },
  { label: 'Users', align: 'end' },
  { label: 'Last seen', align: 'end' },
] as const

export const EMPTY_WORDS: StatusWords = {
  unresolved: 'Nothing unresolved — new errors land here as they arrive.',
  resolved: 'Nothing resolved yet.',
  archived: 'Nothing archived.',
  all: 'No issues match.',
}

export const FILTER_CHIP =
  'inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] transition-colors'

export const ISSUES_TITLE = 'Issues'
export const ISSUES_SUBTITLE = 'One row per stack shape · select rows to resolve, archive or assign'
export const REGRESSIONS_TITLE = 'Regressions'
export const REGRESSIONS_SUBTITLE =
  'Resolved, then seen again — CodeWhiskers reopened them on the next event'
export const UNREACHABLE_NOTE = 'Whiskers is unreachable — showing what was loaded last'
