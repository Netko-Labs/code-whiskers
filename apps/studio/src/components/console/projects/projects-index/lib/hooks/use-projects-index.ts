import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import type { ProjectsIndex } from '../types'
import { projectTotals, sortProjects } from '../utils'

export function useProjectsIndex(): ProjectsIndex {
  const query = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    const projects = sortProjects(query.data ?? [])
    return {
      projects,
      totals: projectTotals(projects),
      isLoading: query.isPending,
      isError: query.isError,
      retry: () => void query.refetch(),
    }
  }, [query])
}
