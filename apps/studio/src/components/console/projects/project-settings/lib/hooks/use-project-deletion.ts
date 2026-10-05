import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  deleteWhiskersProject,
  WHISKERS_QUERY_KEY,
  type WhiskersProject,
} from '@/integrations/whiskers'
import { useConsoleStore } from '../../../../use-console-store'
import type { ProjectDeletion } from '../types'

/** Typing the project's name is the confirmation; nothing it sent can be brought back. */
export function useProjectDeletion(project: WhiskersProject): ProjectDeletion {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState('')
  const mutation = useMutation({
    mutationFn: () => deleteWhiskersProject(project.id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [WHISKERS_QUERY_KEY, 'project', project.id] })
      void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY] })
      useConsoleStore.getState().flash(`${project.name} deleted`)
      void navigate({
        to: '/console/$section',
        params: { section: 'integrations' },
        search: { tab: 1, scope: undefined },
      })
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })
  const canDelete = confirmation.trim() === project.name && !mutation.isPending

  return {
    confirmation,
    canDelete,
    isPending: mutation.isPending,
    setConfirmation,
    remove: () => {
      if (canDelete) mutation.mutate()
    },
  }
}
