import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { whiskersProjectQuery } from '@/integrations/whiskers'
import type { SetupNavigation, SetupSearch } from '../types'

/** The wizard's state is its URL: a reload or a shared link lands on the same step. */
export function useSetupNavigation(search: SetupSearch): SetupNavigation {
  const navigate = useNavigate()
  const projectId = search.project ?? ''
  const project = useQuery({
    ...whiskersProjectQuery(projectId),
    enabled: projectId !== '',
    retry: false,
  })

  return {
    project: project.data,
    isMissing: project.isError,
    go: (patch) =>
      void navigate({ to: '/console/projects/new', search: (prev) => ({ ...prev, ...patch }) }),
  }
}
