import { queryOptions } from '@tanstack/react-query'
import { fetchStudio, STUDIO_QUERY_KEY } from '@/integrations/studio-api'
import {
  type AlertRuleInput,
  type AlertRulePatch,
  alertCreatedSchema,
  alertFiringListSchema,
  alertOkSchema,
  alertPreviewSchema,
  alertRuleListSchema,
  alertRuleSchema,
} from './lib'

/** Realtime's `alerts` topic invalidates both keys under the studio root. */
export const ALERTS_KEY = 'alerts'
export const ALERT_FIRINGS_KEY = 'alert-firings'

export const alertRulesQuery = () =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, ALERTS_KEY],
    queryFn: () => fetchStudio('/alerts', alertRuleListSchema),
    refetchInterval: 60_000,
  })

export const alertRuleQuery = (id: string) =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, ALERTS_KEY, id],
    queryFn: () => fetchStudio(`/alerts/${id}`, alertRuleSchema),
  })

export const alertFiringsQuery = (ruleId?: string) =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, ALERT_FIRINGS_KEY, ruleId ?? 'all'],
    queryFn: () =>
      fetchStudio(
        ruleId ? `/alerts/firings?ruleId=${ruleId}&limit=50` : '/alerts/firings?limit=100',
        alertFiringListSchema,
      ),
  })

/** Keyed by the draft itself, so an unchanged condition is answered from cache. */
export const alertPreviewQuery = (draft: AlertRuleInput | null) =>
  queryOptions({
    queryKey: [STUDIO_QUERY_KEY, 'alert-preview', draft],
    queryFn: () => fetchStudio('/alerts/preview', alertPreviewSchema, 'POST', draft),
    enabled: draft !== null,
    staleTime: 60_000,
    retry: false,
  })

export const createAlertRule = (input: AlertRuleInput) =>
  fetchStudio('/alerts', alertCreatedSchema, 'POST', input)

export const updateAlertRule = (id: string, patch: AlertRulePatch) =>
  fetchStudio(`/alerts/${id}`, alertOkSchema, 'PATCH', patch)

export const deleteAlertRule = (id: string) => fetchStudio(`/alerts/${id}`, alertOkSchema, 'DELETE')
