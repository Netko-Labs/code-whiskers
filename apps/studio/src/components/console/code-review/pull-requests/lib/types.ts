import type { SearchSchemaInput } from '@tanstack/react-router'
import type { MenuOption } from '@/components/shared/toolbar'
import type { PullRequestSummary, PullRequestVerdict } from '../../shared/review-model'

export type PullRequestSort = 'activity' | 'blockers' | 'findings' | 'pushes'

export type PullRequestSearch = {
  repo?: string
  verdict?: string
  mine?: '1'
  sort?: PullRequestSort
}

export type PullRequestSearchInput = {
  repo?: string
  verdict?: string
  mine?: string
  sort?: string
} & SearchSchemaInput

export type PullRequestFilter = {
  repos: string[]
  verdicts: PullRequestVerdict[]
  author: string | null
  query: string
}

export type PullRequestListState = {
  rows: PullRequestSummary[]
  total: number
  running: number
  blocked: number
  repoOptions: MenuOption[]
  verdictOptions: MenuOption[]
  viewerLogin: string | null
  arrivals: Set<string>
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export type PullRequestsPageProps = {
  search: PullRequestSearch
}

export type PullRequestsToolbarProps = {
  search: PullRequestSearch
  query: string
  onQuery: (query: string) => void
  state: PullRequestListState
}

export type PullRequestRowProps = {
  pullRequest: PullRequestSummary
  isArriving: boolean
}

export type PullRequestsBodyProps = {
  state: PullRequestListState
  isFiltered: boolean
}

export type ArrivalEntry = {
  key: string
  stamp: string
}
