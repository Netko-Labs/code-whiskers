import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { instanceQuery, repositoriesQuery } from '@/integrations/studio-api'
import { whiskersReviewsQuery } from '@/integrations/whiskers'
import type { RepositoryListState, RepositoryTab } from '../types'
import { groupByOwner, isOnTab, matchesRepository, repositoryRows } from '../utils'

export function useRepositoryList(tab: RepositoryTab, query: string): RepositoryListState {
  const repositories = useQuery({ ...repositoriesQuery(), retry: false })
  const reviews = useQuery({ ...whiskersReviewsQuery(), retry: false })
  const installUrl = useQuery({ ...instanceQuery(), retry: false }).data?.githubApp.installUrl

  const { data: repoData, isLoading, isError, refetch } = repositories
  const reviewData = reviews.data
  return useMemo(() => {
    const rows = repositoryRows(repoData ?? [], reviewData ?? [])
    return {
      groups: groupByOwner(
        rows.filter((row) => isOnTab(row, tab) && matchesRepository(row, query)),
      ),
      counts: {
        all: rows.length,
        watched: rows.filter((row) => isOnTab(row, 'watched')).length,
        paused: rows.filter((row) => isOnTab(row, 'paused')).length,
      },
      total: rows.length,
      installUrl,
      isLoading,
      isError,
      refetch: () => void refetch(),
    }
  }, [repoData, reviewData, tab, query, installUrl, isLoading, isError, refetch])
}
