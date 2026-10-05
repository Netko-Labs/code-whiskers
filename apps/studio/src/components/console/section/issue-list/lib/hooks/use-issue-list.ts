import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersIssuesQuery, whiskersProjectsQuery } from '@/integrations/whiskers'
import { useTriageRecords, useViewer } from '../../../../shared/console-data'
import type { SectionFilters } from '../../../../shared/console-model'
import { useConsoleScope } from '../../../../shared/console-scope'
import type { IssueSectionView } from '../../../lib'
import type { IssueListState } from '../types'
import { assignedIssueIds, issueListParams, statusForTab, visibleIssues } from '../utils'

/**
 * Server-filtered cursor pages. No project at all, or a scoped project that has sent nothing,
 * turns the empty list into setup; a failed read says unreachable instead.
 */
export function useIssueList(
  section: IssueSectionView,
  tab: number,
  filters: SectionFilters,
): IssueListState {
  const scope = useConsoleScope()
  const records = useTriageRecords()
  const viewer = useViewer()
  const status = statusForTab(section, tab)
  const params = useMemo(() => {
    const mineIds = filters.mine ? assignedIssueIds(records, viewer?.id) : undefined
    return issueListParams(section, status, filters, scope.projectIds, mineIds)
  }, [section, status, filters, scope.projectIds, records, viewer?.id])
  const pages = useInfiniteQuery({ ...whiskersIssuesQuery(params), retry: false })
  const projects = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    const known = projects.data ?? []
    const projectNames = new Map(known.map((p) => [p.id, p.name]))
    const scoped = scope.projectIds?.length === 1 ? scope.projectIds[0] : undefined
    const silentProject = known.find((p) => p.id === scoped && !p.lastEventAt) ?? null
    const rows = visibleIssues(
      pages.data?.pages.flatMap((page) => page.issues) ?? [],
      status,
      section,
    )
    return {
      rows,
      params,
      projectNames,
      total: pages.data?.pages[0]?.total ?? 0,
      hasNoProjects: projects.isSuccess && known.length === 0,
      silentProject,
      isLoading: pages.isLoading,
      isUnreachable: pages.isError || projects.isError,
      hasMore: pages.hasNextPage,
      isLoadingMore: pages.isFetchingNextPage,
      loadMore: () => void pages.fetchNextPage(),
    }
  }, [projects.data, projects.isSuccess, projects.isError, pages, params, status, section, scope])
}
