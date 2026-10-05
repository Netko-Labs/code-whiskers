import { useQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
import { useMemo } from 'react'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import type { Crumb } from '../types'
import { crumbsFor } from '../utils'

export function useBreadcrumbs(): Crumb[] {
  const pathname = useLocation({ select: (location) => location.pathname })
  const { data: projects } = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    const names = new Map((projects ?? []).map((project) => [project.id, project.name]))
    return crumbsFor(pathname, (id) => names.get(id))
  }, [pathname, projects])
}
