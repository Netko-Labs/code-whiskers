import type { WhiskersProject } from '@/integrations/whiskers'
import { PROJECT_SCOPE_PREFIX } from './constants'
import type { ConsoleScope, ScopedSubject } from './types'

export const UNSCOPED: ConsoleScope = {
  value: null,
  repository: null,
  projectIds: undefined,
  label: 'All repositories',
}

function sameRepository(a: string | null | undefined, b: string | null | undefined): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase()
}

export function repositoryName(slug: string): string {
  return slug.split('/')[1] ?? slug
}

export function projectScopeValue(projectId: string): string {
  return `${PROJECT_SCOPE_PREFIX}${projectId}`
}

/** A repository scope reads every project linked to it; a project scope reads that one project. */
export function resolveScope(value: string | null, projects: WhiskersProject[]): ConsoleScope {
  if (!value) return UNSCOPED
  if (value.startsWith(PROJECT_SCOPE_PREFIX)) {
    const projectId = value.slice(PROJECT_SCOPE_PREFIX.length)
    const project = projects.find((candidate) => candidate.id === projectId)
    return {
      value,
      repository: project?.repository ?? null,
      projectIds: [projectId],
      label: project?.name ?? `Project ${projectId}`,
    }
  }
  return {
    value,
    repository: value,
    projectIds: projects
      .filter((project) => sameRepository(project.repository, value))
      .map((project) => project.id),
    label: repositoryName(value),
  }
}

export function isInScope(scope: ConsoleScope, subject: ScopedSubject): boolean {
  if (!scope.value) return true
  if (subject.projectId && scope.projectIds?.includes(subject.projectId)) return true
  return !!scope.repository && sameRepository(subject.repository, scope.repository)
}
