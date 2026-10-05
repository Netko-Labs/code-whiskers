import { useMutation, useQueryClient } from '@tanstack/react-query'
import { STUDIO_QUERY_KEY, syncGithub } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { GithubSyncNow } from '../types'
import { syncMessage } from '../utils'

/** The same sync sign-in runs, on demand: after installing the App on a new account, say. */
export function useGithubSyncNow(): GithubSyncNow {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: syncGithub,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: [STUDIO_QUERY_KEY] })
      useConsoleStore.getState().flash(syncMessage(result))
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })

  return { sync: () => mutation.mutate(), isPending: mutation.isPending }
}
