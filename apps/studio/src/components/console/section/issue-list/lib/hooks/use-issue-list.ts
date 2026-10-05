import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersIssuesQuery, whiskersProjectsQuery } from '@/integrations/whiskers'
import { sampleIssues, useTriageRecords, useViewer } from '../../../../shared/console-data'
import type { SectionFilters } from '../../../../shared/console-model'
import { useConsoleScope } from '../../../../shared/console-scope'
import type { IssueSectionView } from '../../../lib'
import type { IssueListState } from '../types'
import {
  assignedIssueIds,
  issueListParams,
  sampleRows,
  statusForTab,
  visibleIssues,
} from '../utils'

/**
 * Server-filtered cursor pages; the fixture stands in only when both reads succeeded and no
 * project has an issue at all, so an empty tab reads as empty and a failed read as unreachable.
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
    const projectNames = new Map((projects.data ?? []).map((p) => [p.id, p.name]))
    const ingested = (projects.data ?? []).reduce((sum, project) => sum + project.issues, 0)
    const isSample =
      pages.isSuccess && projects.isSuccess && ingested === 0 && !pages.data.pages[0]?.total
    const loaded = isSample
      ? sampleRows(sampleIssues(), params)
      : (pages.data?.pages.flatMap((page) => page.issues) ?? [])
    const rows = visibleIssues(loaded, status, section)
    return {
      rows,
      params,
      projectNames,
      total: isSample ? rows.length : (pages.data?.pages[0]?.total ?? 0),
      isSample,
      isLoading: pages.isLoading,
      isUnreachable: pages.isError || projects.isError,
      hasMore: !isSample && pages.hasNextPage,
      isLoadingMore: pages.isFetchingNextPage,
      loadMore: () => void pages.fetchNextPage(),
    }
  }, [projects.data, projects.isSuccess, projects.isError, pages, params, status, section])
}
