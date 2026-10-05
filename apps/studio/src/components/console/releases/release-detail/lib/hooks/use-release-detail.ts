import { useQuery } from '@tanstack/react-query'
import { ResponseError } from '@/integrations/observability'
import { whiskersProjectQuery, whiskersReleaseQuery } from '@/integrations/whiskers'
import type { ReleaseDetailState } from '../types'

export function useReleaseDetail(projectId: string, version: string): ReleaseDetailState {
  const release = useQuery({
    ...whiskersReleaseQuery(projectId, version),
    enabled: projectId !== '',
    retry: false,
  })
  const project = useQuery({
    ...whiskersProjectQuery(projectId),
    enabled: projectId !== '',
    retry: false,
  })
  const isNotFound = release.error instanceof ResponseError && release.error.status === 404
  return {
    detail: release.data,
    project: project.data,
    isMissing: projectId === '' || isNotFound,
    isError: release.isError && !isNotFound,
    retry: () => void release.refetch(),
  }
}
