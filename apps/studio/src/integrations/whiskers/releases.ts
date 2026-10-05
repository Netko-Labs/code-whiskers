import { queryOptions } from '@tanstack/react-query'
import { fetchWhiskers } from './client'
import {
  COMMIT_SYNC_POLL_MS,
  type CommitStatus,
  WHISKERS_QUERY_KEY,
  whiskersReleaseDetailSchema,
  whiskersSuspectCommitsSchema,
} from './lib'

const pollWhilePending = (status: CommitStatus | null | undefined) =>
  status === 'pending' ? COMMIT_SYNC_POLL_MS : false

// Under the `releases` key so the `issues` realtime topic refreshes them with the list.
export const whiskersReleaseQuery = (projectId: string, version: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'releases', 'detail', projectId, version],
    queryFn: () =>
      fetchWhiskers(
        `/releases/detail?${new URLSearchParams({ projectId, version })}`,
        whiskersReleaseDetailSchema,
      ),
    refetchInterval: (query) => pollWhilePending(query.state.data?.commitStatus),
  })

export const whiskersSuspectCommitsQuery = (issueId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'releases', 'suspects', issueId],
    queryFn: () =>
      fetchWhiskers(
        `/issues/${encodeURIComponent(issueId)}/suspect-commits`,
        whiskersSuspectCommitsSchema,
      ),
    refetchInterval: (query) => pollWhilePending(query.state.data?.commitStatus),
  })
