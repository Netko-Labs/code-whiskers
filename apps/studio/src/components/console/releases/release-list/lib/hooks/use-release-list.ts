import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersProjectsQuery, whiskersReleasesQuery } from '@/integrations/whiskers'
import type { SectionFilters } from '../../../../shared/console-model'
import { isInScope, useConsoleScope } from '../../../../shared/console-scope'
import type { ReleaseListState } from '../types'
import { facetsOf, filterReleases, releaseFilterOf } from '../utils'

/** Releases in the console scope, then the page's own facets and search from the URL. */
export function useReleaseList(tab: number, filters: SectionFilters): ReleaseListState {
  const scope = useConsoleScope()
  const { data, isPending, isError, refetch } = useQuery({
    ...whiskersReleasesQuery(scope.projectIds),
    retry: false,
  })
  const projects = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    const names = new Map((projects.data ?? []).map((project) => [project.id, project.name]))
    const projectName = (projectId: string) => names.get(projectId) ?? `Project ${projectId}`
    const inScope = (data ?? []).filter((release) =>
      isInScope(scope, { projectId: release.projectId }),
    )
    return {
      releases: filterReleases(inScope, releaseFilterOf(tab, filters)),
      inScope,
      facets: facetsOf(inScope, projectName),
      projects: (projects.data ?? []).filter((project) =>
        isInScope(scope, { projectId: project.id, repository: project.repository }),
      ),
      projectName,
      isLoading: isPending || projects.isPending,
      isError,
      retry: () => void refetch(),
    }
  }, [data, isPending, isError, refetch, projects.data, projects.isPending, scope, tab, filters])
}
