import type { MenuOption } from '@/components/shared/toolbar'
import type { PullRequestSort } from './types'

export const PULL_REQUEST_SORTS: MenuOption<PullRequestSort>[] = [
  { value: 'activity', label: 'Last activity' },
  { value: 'blockers', label: 'Most blockers' },
  { value: 'findings', label: 'Most findings' },
  { value: 'pushes', label: 'Most pushes' },
]

export const SORT_VALUES: PullRequestSort[] = ['activity', 'blockers', 'findings', 'pushes']

export const LIST_SEPARATOR = ','
