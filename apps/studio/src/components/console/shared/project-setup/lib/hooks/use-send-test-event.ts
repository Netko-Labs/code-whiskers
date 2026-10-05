import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  sendWhiskersTestEvent,
  WHISKERS_QUERY_KEY,
  type WhiskersTestEvent,
} from '@/integrations/whiskers'
import { useConsoleStore } from '../../../../use-console-store'
import type { TestEventSender } from '../types'

/** Whiskers ingests a synthetic event server-side: proof the project works before any SDK does. */
export function useSendTestEvent(
  projectId: string,
  onSent?: (result: WhiskersTestEvent) => void,
): TestEventSender {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => sendWhiskersTestEvent(projectId),
    onSuccess: (result) => {
      onSent?.(result)
      useConsoleStore.getState().flash('Test event received — it is in Issues')
      void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY] })
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })
  return { send: () => mutation.mutate(), isPending: mutation.isPending }
}
