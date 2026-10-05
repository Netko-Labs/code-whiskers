import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { repositoriesQuery } from '@/integrations/studio-api'
import { createWhiskersProject, WHISKERS_QUERY_KEY } from '@/integrations/whiskers'
import { repositoryOptionsOf } from '../../../../shared/project-setup'
import type { ProjectDraft } from '../types'

/** Name and optional repository for a new project; created on submit, then the wizard moves on. */
export function useProjectDraft(onCreated: (projectId: string) => void): ProjectDraft {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [repository, setRepository] = useState('')
  const repos = useQuery({ ...repositoriesQuery(), retry: false })
  const mutation = useMutation({
    mutationFn: () => createWhiskersProject(name.trim(), repository || null),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY] })
      onCreated(project.id)
    },
  })

  return {
    name,
    repository,
    options: repositoryOptionsOf(repos.data ?? []),
    error: mutation.error?.message ?? null,
    isPending: mutation.isPending,
    setName,
    setRepository,
    create: () => {
      if (name.trim()) mutation.mutate()
    },
  }
}
