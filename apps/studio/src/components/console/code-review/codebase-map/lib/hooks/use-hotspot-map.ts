import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersHotspotsQuery } from '@/integrations/whiskers'
import { isInScope, useConsoleScope } from '../../../../shared/console-scope'
import type { HotspotMapState } from '../types'
import { blockingOf, hotspotRows } from '../utils'

export function useHotspotMap(isBlockingOnly: boolean, query: string): HotspotMapState {
  const scope = useConsoleScope()
  const { data, isLoading, isError, refetch } = useQuery({
    ...whiskersHotspotsQuery(),
    retry: false,
  })

  return useMemo(() => {
    const spots = (data ?? []).filter((spot) => isInScope(scope, { repository: spot.repository }))
    return {
      rows: hotspotRows(spots, { isBlockingOnly, query }),
      total: spots.length,
      blocking: spots.reduce((sum, spot) => sum + blockingOf(spot), 0),
      unowned: spots.filter((spot) => spot.owners.length === 0).length,
      repositories: new Set(spots.map((spot) => spot.repository)).size,
      isLoading,
      isError,
      refetch: () => void refetch(),
    }
  }, [data, scope, isBlockingOnly, query, isLoading, isError, refetch])
}
