import { IconBox, IconLayoutList } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersProjectsQuery } from '@/integrations/whiskers'
import type { NavProjects } from '../types'
import { MAX_NAV_PROJECTS } from '../values'

/** Error-tracking projects, each opening its settings; the full list is one row below them. */
export function useNavProjects(): NavProjects {
  const { data } = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    const projects = data ?? []
    return {
      total: projects.length,
      items: [
        ...projects.slice(0, MAX_NAV_PROJECTS).map((project) => ({
          label: project.name,
          icon: IconBox,
          to: '/console/projects/$projectId',
          params: { projectId: project.id },
        })),
        ...(projects.length > 0
          ? [{ label: 'All projects', icon: IconLayoutList, to: '/console/projects' }]
          : []),
      ],
    }
  }, [data])
}
