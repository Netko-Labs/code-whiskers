import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createSavedQuery, savedQueriesQuery } from '@/integrations/studio-api'
import { useConsoleStore } from '../../../../../use-console-store'
import type { SaveViewProps, SaveViewState } from '../types'

export function useSaveView({ section, params, suggestion }: SaveViewProps): SaveViewState {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  return {
    isOpen,
    name,
    isSaving,
    setName,
    setOpen: (next) => {
      if (next) setName(suggestion)
      setIsOpen(next)
    },
    save: async () => {
      const trimmed = name.trim()
      if (!trimmed || isSaving) return
      setIsSaving(true)
      try {
        await createSavedQuery({
          name: trimmed,
          section,
          tab: 0,
          query: typeof params.q === 'string' ? params.q : null,
          service: typeof params.service === 'string' ? params.service : null,
          params,
        })
        await queryClient.invalidateQueries({ queryKey: savedQueriesQuery().queryKey })
        useConsoleStore.getState().flash(`Saved ${trimmed}`)
        setIsOpen(false)
      } catch (error) {
        useConsoleStore.getState().flash(error instanceof Error ? error.message : 'Not saved')
      } finally {
        setIsSaving(false)
      }
    },
  }
}
