import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import { useConsoleScope } from '../../../../../shared/console-scope'
import { consoleOrigin } from '../../../../../shared/project-setup'
import type { OtlpTarget } from '../types'
import { ingestingProject, otlpEndpoint } from '../utils'

/** Where to point an exporter: this console's `/otlp` and a key of the project in scope. */
export function useOtlpTarget(): OtlpTarget {
  const scope = useConsoleScope()
  const { data: projects, isPending } = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    const project = ingestingProject(projects ?? [], scope.projectIds)
    return {
      isLoading: isPending,
      project,
      key: project?.keys.find((key) => key.isEnabled) ?? null,
      endpoint: otlpEndpoint(consoleOrigin()),
    }
  }, [projects, isPending, scope.projectIds])
}
