import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { repositoriesQuery } from '@/integrations/studio-api'
import {
  updateWhiskersProject,
  WHISKERS_QUERY_KEY,
  type WhiskersProject,
} from '@/integrations/whiskers'
import { repositoryOptionsOf } from '../../../../shared/project-setup'
import { useConsoleStore } from '../../../../use-console-store'
import type { ProjectGeneralForm } from '../types'

export function useProjectGeneral(project: WhiskersProject): ProjectGeneralForm {
  const queryClient = useQueryClient()
  const [name, setName] = useState(project.name)
  const [repository, setRepository] = useState(project.repository ?? '')
  const repos = useQuery({ ...repositoriesQuery(), retry: false })
  const mutation = useMutation({
    mutationFn: () =>
      updateWhiskersProject(project.id, { name: name.trim(), repository: repository || null }),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY] })
      useConsoleStore.getState().flash(`${saved.name} saved`)
    },
    onError: (error: Error) => useConsoleStore.getState().flash(error.message),
  })

  return {
    name,
    repository,
    options: repositoryOptionsOf(repos.data ?? []),
    isDirty: name.trim() !== project.name || (repository || null) !== project.repository,
    isPending: mutation.isPending,
    setName,
    setRepository,
    save: () => {
      if (name.trim()) mutation.mutate()
    },
  }
}
