import type { WhiskersProject } from '@/integrations/whiskers'

export type ProjectTotals = {
  projects: number
  issues: number
  silent: number
}

export type ProjectsIndex = {
  projects: WhiskersProject[]
  totals: ProjectTotals
  isLoading: boolean
  isError: boolean
  retry: () => void
}

export type ProjectRowProps = {
  project: WhiskersProject
}
