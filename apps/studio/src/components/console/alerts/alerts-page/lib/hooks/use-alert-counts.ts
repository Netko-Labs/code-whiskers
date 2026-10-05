import { useQuery } from '@tanstack/react-query'
import { alertRulesQuery } from '@/integrations/alerts-api'
import { integrationsQuery } from '@/integrations/studio-api'
import type { AlertCounts } from '../types'

/** Tab counts appear once known; blank beats a fake zero. */
export function useAlertCounts(): AlertCounts {
  const rules = useQuery({ ...alertRulesQuery(), retry: false })
  const destinations = useQuery({ ...integrationsQuery(), retry: false })
  return { rules: rules.data?.length, destinations: destinations.data?.length }
}
