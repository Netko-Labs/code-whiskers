import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { studioStorageQuery } from '@/integrations/studio-api'
import { whiskersInstanceQuery } from '@/integrations/whiskers'
import type { InstanceUsage } from '../types'
import { mergeStores } from '../utils'

/** Both databases, one picture: whiskers answers for its tables, studio for its own. */
export function useInstanceUsage(): InstanceUsage {
  const worker = useQuery({ ...whiskersInstanceQuery(), retry: false })
  const studio = useQuery({ ...studioStorageQuery(), retry: false })

  return useMemo(
    () => ({
      worker: worker.data,
      stores: mergeStores(worker.data, studio.data),
      databaseBytes: (worker.data?.databaseBytes ?? 0) + (studio.data?.databaseBytes ?? 0),
      isLoading: worker.isPending && studio.isPending,
      isError: worker.isError && studio.isError,
      retry: () => {
        void worker.refetch()
        void studio.refetch()
      },
    }),
    [worker, studio],
  )
}
