import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useReducer, useState } from 'react'
import {
  ALERTS_KEY,
  type AlertRule,
  createAlertRule,
  deleteAlertRule,
  updateAlertRule,
} from '@/integrations/alerts-api'
import { integrationsQuery, organizationsQuery, STUDIO_QUERY_KEY } from '@/integrations/studio-api'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import { useConsoleStore } from '../../../../use-console-store'
import type { RuleDraft, RuleEditorModel } from '../types'
import { draftProblem, draftReducer, inputFromDraft, isSameDraft } from '../utils'

const flash = (message: string) => useConsoleStore.getState().flash(message)

async function persist(rule: AlertRule | null, draft: RuleDraft): Promise<string> {
  const input = inputFromDraft(draft)
  if (!input) throw new Error(draftProblem(draft) ?? 'The rule is incomplete')
  if (!rule) return (await createAlertRule(input)).id
  const { installationId: _, ...patch } = input
  await updateAlertRule(rule.id, patch)
  return rule.id
}

export function useRuleEditor(initial: RuleDraft, rule: AlertRule | null): RuleEditorModel {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [draft, dispatch] = useReducer(draftReducer, initial)
  const [baseline, setBaseline] = useState(initial)
  const orgs = useQuery({ ...organizationsQuery(), retry: false })
  const projects = useQuery({ ...whiskersProjectsQuery(), retry: false })
  const destinations = useQuery({ ...integrationsQuery(), retry: false })
  const refresh = () => queryClient.invalidateQueries({ queryKey: [STUDIO_QUERY_KEY, ALERTS_KEY] })

  const save = useMutation({
    mutationFn: () => persist(rule, draft),
    onSuccess: (id) => {
      void refresh()
      setBaseline(draft)
      flash(rule ? `${draft.name.trim()} saved` : `${draft.name.trim()} armed`)
      if (!rule) void navigate({ to: '/console/alerts/$ruleId', params: { ruleId: id } })
    },
    onError: (error: Error) => flash(error.message),
  })
  const remove = useMutation({
    mutationFn: () => (rule ? deleteAlertRule(rule.id) : Promise.resolve(null)),
    onSuccess: () => {
      void refresh()
      flash(`${rule?.name ?? 'Rule'} deleted`)
      void navigate({ to: '/console/alerts' })
    },
    onError: (error: Error) => flash(error.message),
  })

  const installation = orgs.data?.find((org) => org.installationId === draft.installationId)
  const owner = installation?.login.toLowerCase()
  return {
    draft,
    dispatch,
    installations: orgs.data ?? [],
    projects: (projects.data ?? []).filter(
      (project) => !project.repository || project.repository.split('/')[0]?.toLowerCase() === owner,
    ),
    destinations: (destinations.data ?? []).filter(
      (destination) => destination.installationId === draft.installationId,
    ),
    problem: draftProblem(draft),
    isDirty: !rule || !isSameDraft(draft, baseline),
    isSaving: save.isPending || remove.isPending,
    save: () => save.mutate(),
    remove: () => remove.mutate(),
  }
}
