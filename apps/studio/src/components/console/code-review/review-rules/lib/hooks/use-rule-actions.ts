import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  createRule,
  deleteRule,
  type ReviewRule,
  rulesQuery,
  updateRule,
} from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../use-console-store'
import type { RuleActions, RuleDraft } from '../types'
import { EVERYWHERE } from '../values'

/** Rules are the team's; the reviewer reads changes within a minute. */
export function useRuleActions(): RuleActions {
  const queryClient = useQueryClient()

  return useMemo(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: rulesQuery().queryKey })
    const flash = (message: string, onUndo?: () => void) =>
      useConsoleStore.getState().flash(message, onUndo)
    const fail = (error: Error) => flash(error.message)
    const recreate = (rule: ReviewRule) =>
      createRule({
        installationId: rule.installationId,
        body: rule.body,
        scope: rule.scope,
        effect: rule.effect,
      })
        .then(refresh)
        .catch(fail)

    return {
      save: async (draft: RuleDraft) => {
        const fields = {
          body: draft.body.trim(),
          scope: draft.scope.trim() || EVERYWHERE,
          effect: draft.effect,
        }
        if (draft.id) await updateRule(draft.id, fields)
        else await createRule({ ...fields, installationId: Number(draft.installationId) })
        await refresh()
        flash(
          draft.id
            ? 'Rule updated; the next review reads it'
            : 'Rule saved; the next review reads it',
        )
      },
      toggleMute: (rule: ReviewRule) => {
        updateRule(rule.id, { isMuted: !rule.isMuted })
          .then(refresh)
          .then(() =>
            flash(rule.isMuted ? 'Rule is back on' : 'Rule muted; the reviewer stops reading it'),
          )
          .catch(fail)
      },
      remove: (rule: ReviewRule) => {
        deleteRule(rule.id)
          .then(refresh)
          .then(() => flash('Rule deleted', () => void recreate(rule)))
          .catch(fail)
      },
    }
  }, [queryClient])
}
