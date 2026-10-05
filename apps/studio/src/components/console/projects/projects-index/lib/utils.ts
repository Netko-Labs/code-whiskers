import type { WhiskersProject } from '@/integrations/whiskers'
import type { ProjectTotals } from './types'

/** Most recently heard from first; projects that never sent anything sink, newest first. */
export function sortProjects(projects: WhiskersProject[]): WhiskersProject[] {
  return [...projects].sort((a, b) => {
    const heard = (b.lastEventAt?.getTime() ?? 0) - (a.lastEventAt?.getTime() ?? 0)
    return heard !== 0 ? heard : b.createdAt.getTime() - a.createdAt.getTime()
  })
}

export function filterProjects(projects: WhiskersProject[], query: string): WhiskersProject[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return projects
  return projects.filter((project) =>
    [project.name, project.repository ?? '', project.id].some((value) =>
      value.toLowerCase().includes(needle),
    ),
  )
}

export function projectTotals(projects: WhiskersProject[]): ProjectTotals {
  return {
    projects: projects.length,
    issues: projects.reduce((sum, project) => sum + project.issues, 0),
    silent: projects.filter((project) => !project.lastEventAt).length,
  }
}

export function enabledKeys(project: WhiskersProject): number {
  return project.keys.filter((key) => key.isEnabled).length
}
