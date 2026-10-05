import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { githubLoginQuery } from '@/integrations/studio-api'
import { whiskersReviewsQuery } from '@/integrations/whiskers'
import { isInScope, useConsoleScope } from '../../../../shared/console-scope'
import { blockerCount, summarizePullRequests } from '../../../shared/review-model'
import type { PullRequestListState, PullRequestSearch } from '../types'
import {
  filterPullRequests,
  listOf,
  repoOptions,
  sortPullRequests,
  verdictOptions,
  verdictsOf,
} from '../utils'
import { useArrivals } from './use-arrivals'

/** Reviews arrive per push; the list is per pull request, filtered in the browser. */
export function usePullRequestList(search: PullRequestSearch, query: string): PullRequestListState {
  const scope = useConsoleScope()
  const { data, isLoading, isError, refetch } = useQuery({
    ...whiskersReviewsQuery(),
    retry: false,
  })
  const viewerLogin = useQuery({ ...githubLoginQuery(), retry: false }).data?.login ?? null

  const all = useMemo(
    () =>
      summarizePullRequests(data ?? []).filter((row) => isInScope(scope, { repository: row.slug })),
    [data, scope],
  )
  const stamps = useMemo(
    () => all.map((row) => ({ key: row.key, stamp: `${row.latest.id}:${row.latest.status}` })),
    [all],
  )
  const arrivals = useArrivals(stamps)

  return useMemo(() => {
    const filtered = filterPullRequests(all, {
      repos: listOf(search.repo),
      verdicts: verdictsOf(search.verdict),
      author: search.mine ? viewerLogin : null,
      query,
    })
    return {
      rows: sortPullRequests(
        search.mine && !viewerLogin ? [] : filtered,
        search.sort ?? 'activity',
      ),
      total: all.length,
      running: all.filter((row) => row.verdict === 'running').length,
      blocked: all.filter((row) => blockerCount(row.counts) > 0).length,
      repoOptions: repoOptions(all),
      verdictOptions: verdictOptions(all),
      viewerLogin,
      arrivals,
      isLoading,
      isError,
      refetch: () => void refetch(),
    }
  }, [all, search, query, viewerLogin, arrivals, isLoading, isError, refetch])
}
