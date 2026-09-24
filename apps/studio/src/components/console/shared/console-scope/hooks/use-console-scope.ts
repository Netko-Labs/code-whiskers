import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import type { ConsoleScope } from '../types'
import { resolveScope } from '../utils'

export function useConsoleScope(): ConsoleScope {
  const value = useSearch({ strict: false, select: (search) => search.scope ?? null })
  const { data: projects } = useQuery({ ...whiskersProjectsQuery(), retry: false })
  return useMemo(() => resolveScope(value, projects ?? []), [value, projects])
}
