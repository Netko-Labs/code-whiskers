import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ApiKey, apiKeysQuery, revokeApiKey } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { ApiKeyRevoke } from '../types'
import { markRevoked } from '../utils'

/** Optimistic: the key moves to Revoked at once and comes back if studio refuses. */
export function useApiKeyRevoke(): ApiKeyRevoke {
  const queryClient = useQueryClient()
  const key = apiKeysQuery().queryKey

  const mutation = useMutation({
    mutationFn: (apiKey: ApiKey) => revokeApiKey(apiKey.id),
    onMutate: async (apiKey) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)
      if (previous) queryClient.setQueryData(key, markRevoked(previous, apiKey.id, new Date()))
      return { previous }
    },
    onError: (error: Error, _apiKey, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      useConsoleStore.getState().flash(error.message)
    },
    onSuccess: (_result, apiKey) => useConsoleStore.getState().flash(`${apiKey.name} revoked`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { revoke: (apiKey) => mutation.mutate(apiKey) }
}
