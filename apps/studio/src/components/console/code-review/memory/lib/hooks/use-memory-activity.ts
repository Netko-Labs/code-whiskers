import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  type MemoryActivity,
  memoryActivityQuery,
  memoryQuery,
  undoMemoryActivity,
} from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { ActivityState } from '../types'

/** The audit trail: everything people and the reviewer changed, each step undoable once. */
export function useMemoryActivity(): ActivityState {
  const queryClient = useQueryClient()
  const activity = useQuery({ ...memoryActivityQuery(), retry: false })
  const { data, isLoading, isError, refetch } = activity

  return useMemo(
    () => ({
      entries: data ?? [],
      isLoading,
      isError,
      refetch: () => void refetch(),
      undo: (entry: MemoryActivity) => {
        const { flash } = useConsoleStore.getState()
        undoMemoryActivity(entry.id)
          .then(() =>
            Promise.all([
              queryClient.invalidateQueries({ queryKey: memoryQuery().queryKey }),
              queryClient.invalidateQueries({ queryKey: memoryActivityQuery().queryKey }),
            ]),
          )
          .then(() => flash('Change undone'))
          .catch((error: Error) => flash(error.message))
      },
    }),
    [data, isLoading, isError, refetch, queryClient],
  )
}
