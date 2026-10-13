import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { memoryQuery, organizationsQuery, repositoriesQuery } from '@/integrations/studio-api'
import type { MemoryState, MemoryTab } from '../types'
import { isOnTab, sortNotes } from '../utils'

export function useMemory(): MemoryState {
  const notes = useQuery({ ...memoryQuery(), retry: false })
  const organizations = useQuery({ ...organizationsQuery(), retry: false })
  const repositories = useQuery({ ...repositoriesQuery(), retry: false })

  const { data: noteData, isError, refetch } = notes
  const { data: orgData } = organizations
  const { data: repoData } = repositories
  const isLoading = notes.isLoading || organizations.isLoading
  return useMemo(() => {
    const all = sortNotes(noteData ?? [])
    const count = (tab: MemoryTab) => all.filter((note) => isOnTab(note, tab)).length
    return {
      notes: all,
      organizations: orgData ?? [],
      repositories: repoData ?? [],
      counts: {
        all: count('all'),
        retired: count('retired'),
        rule: count('rule'),
        dont_flag: count('dont_flag'),
        lesson: count('lesson'),
        context: count('context'),
        preference: count('preference'),
      },
      isLoading,
      isError,
      refetch: () => void refetch(),
    }
  }, [noteData, orgData, repoData, isLoading, isError, refetch])
}
