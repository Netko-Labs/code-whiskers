import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Integration, integrationsQuery, testIntegration } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'

/** "Send test" beside each destination in the THEN card; the id being tested, if any. */
export function useDestinationTest() {
  const queryClient = useQueryClient()
  const test = useMutation({
    mutationFn: (destination: Integration) => testIntegration(destination.id),
    onSuccess: (result, destination) => {
      useConsoleStore
        .getState()
        .flash(
          result.delivered
            ? `Test delivered to ${destination.name}`
            : `${destination.name} refused it${result.error ? `: ${result.error}` : ''}`,
        )
      void queryClient.invalidateQueries({ queryKey: integrationsQuery().queryKey })
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })
  return {
    testingId: test.isPending ? (test.variables?.id ?? null) : null,
    send: (destination: Integration) => test.mutate(destination),
  }
}
