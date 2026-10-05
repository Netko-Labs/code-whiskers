import { useQuery } from '@tanstack/react-query'
import { type OverviewRange, whiskersOverviewQuery } from '@/integrations/whiskers'
import { useConsoleScope } from '../../../shared/console-scope'
import type { OverviewData } from '../types'

/** The ranged numbers for whatever the scope picker says; realtime refetches them. */
export function useOverviewData(range: OverviewRange): OverviewData {
  const scope = useConsoleScope()
  const query = useQuery({
    ...whiskersOverviewQuery({
      range,
      projectIds: scope.projectIds,
      repository: scope.repository,
    }),
    retry: false,
  })
  return {
    overview: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    retry: () => void query.refetch(),
  }
}
