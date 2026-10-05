import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersReleasesQuery } from '@/integrations/whiskers'
import { useConsoleScope } from '../../../../shared/console-scope'
import type { FilterOptions } from '../types'
import { filterOptions } from '../utils'

/** Environments and releases the scope has actually seen, newest first. */
export function useFilterOptions(): FilterOptions {
  const scope = useConsoleScope()
  const { data } = useQuery({ ...whiskersReleasesQuery(scope.projectIds), retry: false })
  return useMemo(() => filterOptions(data ?? []), [data])
}
