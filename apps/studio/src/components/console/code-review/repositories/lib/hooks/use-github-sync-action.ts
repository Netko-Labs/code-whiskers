import { useMutation, useQueryClient } from '@tanstack/react-query'
import { STUDIO_QUERY_KEY, syncGithub } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { GithubSyncState } from '../types'

export function useGithubSyncAction(): GithubSyncState {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: syncGithub,
    onSuccess: (result) => {
      useConsoleStore
        .getState()
        .flash(
          result.skipped
            ? 'This session has no GitHub token; sign in with GitHub to sync'
            : `Synced ${result.organizations} installations, ${result.repositories} repositories`,
        )
      return queryClient.invalidateQueries({ queryKey: [STUDIO_QUERY_KEY] })
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })
  return { sync: () => mutate(), isSyncing: isPending }
}
