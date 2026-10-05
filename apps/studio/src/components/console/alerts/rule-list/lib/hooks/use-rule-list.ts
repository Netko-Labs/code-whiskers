import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type AlertRule, alertRulesQuery, updateAlertRule } from '@/integrations/alerts-api'
import { integrationsQuery, organizationsQuery } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { RuleListModel } from '../types'

export function useRuleList(): RuleListModel {
  const queryClient = useQueryClient()
  const rules = useQuery({ ...alertRulesQuery(), retry: false })
  const orgs = useQuery({ ...organizationsQuery(), retry: false })
  const destinations = useQuery({ ...integrationsQuery(), retry: false })
  const toggle = useMutation({
    mutationFn: ({ rule, isEnabled }: { rule: AlertRule; isEnabled: boolean }) =>
      updateAlertRule(rule.id, { isMuted: !isEnabled }),
    onSuccess: (_, { rule, isEnabled }) => {
      void queryClient.invalidateQueries({ queryKey: alertRulesQuery().queryKey })
      useConsoleStore.getState().flash(isEnabled ? `${rule.name} armed` : `${rule.name} muted`)
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })

  return {
    rules: rules.data ?? [],
    destinations: destinations.data ?? [],
    hasInstallation: (orgs.data?.length ?? 0) > 0,
    isLoading: rules.isPending || orgs.isPending,
    isError: rules.isError,
    retry: () => void rules.refetch(),
    setEnabled: (rule, isEnabled) => toggle.mutate({ rule, isEnabled }),
  }
}
