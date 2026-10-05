import { useQueryClient } from '@tanstack/react-query'
import { deleteSavedQuery, renameSavedQuery, savedQueriesQuery } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { SavedQueryActions } from '../types'

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong'
}

export function useSavedQueryActions(): SavedQueryActions {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: savedQueriesQuery().queryKey })

  return {
    rename: async (saved, name) => {
      try {
        await renameSavedQuery(saved.id, name)
        await refresh()
        useConsoleStore.getState().flash(`Renamed to ${name}`)
        return true
      } catch (error) {
        useConsoleStore.getState().flash(messageOf(error))
        return false
      }
    },
    remove: (saved) => {
      deleteSavedQuery(saved.id)
        .then(refresh)
        .then(() => useConsoleStore.getState().flash(`${saved.name} deleted`))
        .catch((error: unknown) => useConsoleStore.getState().flash(messageOf(error)))
    },
  }
}
