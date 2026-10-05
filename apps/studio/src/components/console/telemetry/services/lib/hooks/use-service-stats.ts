import { useQuery } from '@tanstack/react-query'
import { whiskersServiceStatsQuery } from '@/integrations/whiskers'
import { useConsoleScope } from '../../../../shared/console-scope'
import { boundsOf, windowSpecOf } from '../../../shared/telemetry-time'
import type { ServiceStatsState, ServicesSearch } from '../types'
import { SERVICE_BUCKETS, SERVICES_RANGE_FALLBACK } from '../values'

export function useServiceStats(search: ServicesSearch): ServiceStatsState {
  const scope = useConsoleScope()
  const query = useQuery({
    ...whiskersServiceStatsQuery(
      scope.projectIds,
      windowSpecOf(search, SERVICES_RANGE_FALLBACK),
      SERVICE_BUCKETS,
    ),
    retry: false,
  })
  const bounds = boundsOf(search, SERVICES_RANGE_FALLBACK)

  return {
    services: query.data?.services ?? [],
    windowMs: bounds.to - bounds.from,
    isPending: query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
  }
}
