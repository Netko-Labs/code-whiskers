import type { MenuOption } from '@/components/shared/toolbar'
import type { WhiskersProject, WhiskersRelease } from '@/integrations/whiskers'
import type { SectionFilters } from '../../../shared/console-model'

export type ReleaseListProps = {
  tab: number
  filters: SectionFilters
}

export type ReleaseFilter = {
  projectIds: string[]
  environments: string[]
  q: string
  hasNewIssuesOnly: boolean
}

export type ReleaseFacets = {
  projects: MenuOption[]
  environments: MenuOption[]
}

export type ReleaseListState = {
  releases: WhiskersRelease[]
  /** Every release in scope, before the page's own filters. */
  inScope: WhiskersRelease[]
  facets: ReleaseFacets
  projects: WhiskersProject[]
  projectName: (projectId: string) => string
  isLoading: boolean
  isError: boolean
  retry: () => void
}

export type ReleaseListRowProps = {
  release: WhiskersRelease
  projectName: string
  hasProjectColumn: boolean
}

export type ReleaseEnvChipsProps = {
  release: WhiskersRelease
}

export type ReleaseListToolbarProps = {
  tab: number
  filters: SectionFilters
  facets: ReleaseFacets
}

export type ReleaseListEmptyProps = {
  projects: WhiskersProject[]
}
