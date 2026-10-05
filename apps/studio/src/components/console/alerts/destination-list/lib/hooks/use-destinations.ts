import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ALERTS_KEY } from '@/integrations/alerts-api'
import {
  deleteIntegration,
  type Integration,
  integrationsQuery,
  organizationsQuery,
  STUDIO_QUERY_KEY,
  testIntegration,
} from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { DestinationsModel } from '../types'

const flash = (message: string) => useConsoleStore.getState().flash(message)

export function useDestinations(): DestinationsModel {
  const queryClient = useQueryClient()
  const destinations = useQuery({ ...integrationsQuery(), retry: false })
  const orgs = useQuery({ ...organizationsQuery(), retry: false })
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: integrationsQuery().queryKey })
    void queryClient.invalidateQueries({ queryKey: [STUDIO_QUERY_KEY, ALERTS_KEY] })
  }
  const test = useMutation({
    mutationFn: (destination: Integration) => testIntegration(destination.id),
    onSuccess: (result, destination) => {
      flash(
        result.delivered
          ? `Test delivered to ${destination.name}`
          : `${destination.name} refused it${result.error ? `: ${result.error}` : ''}`,
      )
      refresh()
    },
    onError: (error: Error) => flash(error.message),
  })
  const remove = useMutation({
    mutationFn: (destination: Integration) => deleteIntegration(destination.id),
    onSuccess: (_, destination) => {
      flash(`${destination.name} removed`)
      refresh()
    },
    onError: (error: Error) => flash(error.message),
  })

  return {
    destinations: destinations.data ?? [],
    installations: orgs.data ?? [],
    isLoading: destinations.isPending || orgs.isPending,
    isError: destinations.isError,
    retry: () => void destinations.refetch(),
    testingId: test.isPending ? (test.variables?.id ?? null) : null,
    test: (destination) => test.mutate(destination),
    remove: (destination) => remove.mutate(destination),
  }
}
