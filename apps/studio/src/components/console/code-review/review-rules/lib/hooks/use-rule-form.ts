import { useState } from 'react'
import type { RuleDraft, RuleFormState } from '../types'
import { draftError } from '../utils'
import { useRuleActions } from './use-rule-actions'

export function useRuleForm(initial: RuleDraft): RuleFormState {
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setSaving] = useState(false)
  const { save } = useRuleActions()

  return {
    draft,
    error,
    isSaving,
    update: (patch) => {
      setDraft((current) => ({ ...current, ...patch }))
      setError(null)
    },
    submit: async () => {
      const problem = draftError(draft)
      if (problem) {
        setError(problem)
        return false
      }
      setSaving(true)
      try {
        await save(draft)
        return true
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : 'The rule was not saved')
        return false
      } finally {
        setSaving(false)
      }
    },
  }
}
