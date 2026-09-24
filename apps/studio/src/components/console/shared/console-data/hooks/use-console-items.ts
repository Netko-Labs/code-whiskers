import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  whiskersIssuesQuery,
  whiskersLogPatternsQuery,
  whiskersProjectsQuery,
  whiskersReviewsQuery,
} from '@/integrations/whiskers'
import type { ConsoleItem } from '../../console-model'
import {
  issueToConsoleItem,
  latestReviewPerPullRequest,
  logPatternToConsoleItem,
  reviewToConsoleItem,
} from '../utils'
import { SAMPLE_ITEMS } from '../values'

export type ConsoleItemsResult = {
  items: ConsoleItem[]
  /** True when nothing has been ingested yet and the list falls back to the sample set. */
  sample: boolean
  unreachable: boolean
  isLoading: boolean
}

export function useConsoleItems(): ConsoleItemsResult {
  const issues = useQuery({ ...whiskersIssuesQuery(), retry: false })
  const reviews = useQuery({ ...whiskersReviewsQuery(), retry: false })
  const patterns = useQuery({ ...whiskersLogPatternsQuery(), retry: false })
  const projects = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    const projectById = new Map((projects.data ?? []).map((project) => [project.id, project]))
    const live = [
      ...(issues.data ?? []).map((issue) =>
        issueToConsoleItem(issue, projectById.get(issue.projectId)),
      ),
      ...latestReviewPerPullRequest(reviews.data ?? []).map(reviewToConsoleItem),
      ...(patterns.data ?? []).map((pattern) =>
        logPatternToConsoleItem(pattern, projectById.get(pattern.projectId)),
      ),
    ].sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
    const unreachable = issues.isError || reviews.isError

    return {
      items: live.length > 0 ? live : SAMPLE_ITEMS,
      sample: live.length === 0,
      unreachable,
      isLoading: issues.isLoading || reviews.isLoading,
    }
  }, [
    issues.data,
    issues.isError,
    issues.isLoading,
    reviews.data,
    reviews.isError,
    reviews.isLoading,
    patterns.data,
    projects.data,
  ])
}
