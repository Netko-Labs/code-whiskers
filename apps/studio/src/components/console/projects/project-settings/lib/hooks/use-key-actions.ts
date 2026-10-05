import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  createWhiskersProjectKey,
  deleteWhiskersProjectKey,
  updateWhiskersProjectKey,
  WHISKERS_QUERY_KEY,
} from '@/integrations/whiskers'
import { useConsoleStore } from '../../../../use-console-store'
import type { KeyActions, KeyChange } from '../types'

function apply(projectId: string, change: KeyChange): Promise<unknown> {
  if (change.kind === 'add') return createWhiskersProjectKey(projectId, change.label)
  if (change.kind === 'enable') {
    return updateWhiskersProjectKey(projectId, change.key.id, { isEnabled: change.isEnabled })
  }
  return deleteWhiskersProjectKey(projectId, change.key.id)
}

/** Whiskers enforces the last-enabled-key rule; a refusal comes back as its own sentence. */
export function useKeyActions(projectId: string): KeyActions {
  const queryClient = useQueryClient()
  const [label, setLabel] = useState('')
  const mutation = useMutation({
    mutationFn: (change: KeyChange) => apply(projectId, change),
    onSuccess: (_, change) => {
      void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY] })
      if (change.kind === 'add') setLabel('')
      const flash = useConsoleStore.getState().flash
      if (change.kind === 'add') flash(`Key ${change.label} added`)
      if (change.kind === 'enable') {
        flash(`${change.key.label} ${change.isEnabled ? 'enabled' : 'disabled'}`)
      }
      if (change.kind === 'delete') flash(`${change.key.label} deleted`)
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })

  return {
    label,
    isPending: mutation.isPending,
    setLabel,
    add: () => {
      if (label.trim()) mutation.mutate({ kind: 'add', label: label.trim() })
    },
    setEnabled: (key, isEnabled) => mutation.mutate({ kind: 'enable', key, isEnabled }),
    remove: (key) => mutation.mutate({ kind: 'delete', key }),
  }
}
