import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { instanceQuery, organizationsQuery, repositoriesQuery } from '@/integrations/studio-api'
import type { GithubConnection } from '../types'
import { latestSync, summarizeInstallations } from '../utils'

export function useGithubConnection(): GithubConnection {
  const orgs = useQuery({ ...organizationsQuery(), retry: false })
  const repos = useQuery({ ...repositoriesQuery(), retry: false })
  const { data: instance } = useQuery({ ...instanceQuery(), retry: false })

  return useMemo(() => {
    const installations = summarizeInstallations({
      orgs: orgs.data ?? [],
      repos: repos.data ?? [],
    })
    return {
      installations,
      repositories: repos.data?.length ?? 0,
      watched: installations.reduce((sum, item) => sum + item.watched, 0),
      lastSyncedAt: latestSync(orgs.data ?? []),
      app: instance?.githubApp,
      isLoading: orgs.isPending,
      isError: orgs.isError,
      retry: () => {
        void orgs.refetch()
        void repos.refetch()
      },
    }
  }, [orgs, repos, instance])
}
