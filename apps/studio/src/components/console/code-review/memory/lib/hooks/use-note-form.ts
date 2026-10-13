import { useState } from 'react'
import type { NoteDraft, NoteFormState } from '../types'
import { draftError } from '../utils'
import { useMemoryActions } from './use-memory-actions'

export function useNoteForm(initial: NoteDraft): NoteFormState {
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setSaving] = useState(false)
  const { save } = useMemoryActions()

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
        setError(failure instanceof Error ? failure.message : 'The note was not saved')
        return false
      } finally {
        setSaving(false)
      }
    },
  }
}
