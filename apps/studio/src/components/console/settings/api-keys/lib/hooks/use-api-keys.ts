import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { apiKeysQuery } from '@/integrations/studio-api'
import type { ApiKeyListState } from '../types'
import { groupApiKeys } from '../utils'

export function useApiKeys(): ApiKeyListState {
  const query = useQuery({ ...apiKeysQuery(), retry: false })

  return useMemo(
    () => ({
      ...groupApiKeys(query.data ?? []),
      isLoading: query.isPending,
      isError: query.isError,
      retry: () => void query.refetch(),
    }),
    [query],
  )
}
