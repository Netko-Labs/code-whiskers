import type { Repository } from '@/integrations/studio-api'
import type { PullRequestSummary } from '../../shared/review-model'

export type RepositoryTab = 'all' | 'watched' | 'paused'

/** Studio's repository joined with what whiskers reviewed there. */
export type RepositoryRow = {
  repository: Repository
  slug: string
  reviews: number
  pullRequests: number
  lastPullRequest: PullRequestSummary | undefined
  openBlockers: number
}

export type RepositoryGroup = {
  owner: string
  rows: RepositoryRow[]
}

export type RepositoryListState = {
  groups: RepositoryGroup[]
  counts: Record<RepositoryTab, number>
  total: number
  installUrl: string | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export type RepositoryActions = {
  setWatched: (repository: Repository, isWatched: boolean) => void
}

export type RepositoryRowProps = {
  row: RepositoryRow
}

export type RepositoriesBodyProps = {
  state: RepositoryListState
  isFiltered: boolean
}

export type RepositoriesActionsProps = {
  installUrl: string | undefined
}

export type GithubSyncState = {
  sync: () => void
  isSyncing: boolean
}
