import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { type AlertRule, alertRulesQuery, updateAlertRule } from '@/integrations/alerts-api'
import { isTyping, useDocumentKeydown } from '@/shared/dom-events'
import { useConsoleStore } from '../../../use-console-store'
import type { AlertActions } from '../types'

function setState(queryClient: QueryClient, id: string, state: AlertRule['state']) {
  queryClient.setQueryData(alertRulesQuery().queryKey, (rules = []) =>
    rules.map((rule) => (rule.id === id ? { ...rule, state } : rule)),
  )
}

/** Muting is the alert's "done": the rule stops firing until someone arms it again. e mutes. */
export function useAlertActions(rule: AlertRule): AlertActions {
  const queryClient = useQueryClient()

  const actions = useMemo(() => {
    const write = (isMuted: boolean, previous: AlertRule['state']) => {
      setState(queryClient, rule.id, isMuted ? 'muted' : 'armed')
      updateAlertRule(rule.id, { isMuted }).catch(() => {
        setState(queryClient, rule.id, previous)
        useConsoleStore.getState().flash('Could not change the alert — nothing changed')
      })
    }
    return {
      mute: () => {
        write(true, rule.state)
        useConsoleStore
          .getState()
          .flash(`Muted ${rule.name} — it stays quiet until you arm it`, () =>
            write(false, 'muted'),
          )
      },
    }
  }, [rule, queryClient])

  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      if (event.key !== 'e') return
      event.preventDefault()
      actions.mute()
    },
    [actions],
  )
  useDocumentKeydown(onKey)

  return actions
}
