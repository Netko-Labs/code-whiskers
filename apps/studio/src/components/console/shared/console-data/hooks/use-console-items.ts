import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
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
import { INBOX_ISSUE_QUERY } from '../values'

export type ConsoleItemsResult = {
  items: ConsoleItem[]
  unreachable: boolean
  isLoading: boolean
}

/** Triage reads unresolved issues only: resolving or archiving one takes it out of the inbox. */
export function useConsoleItems(): ConsoleItemsResult {
  const issues = useInfiniteQuery({ ...whiskersIssuesQuery(INBOX_ISSUE_QUERY), retry: false })
  const reviews = useQuery({ ...whiskersReviewsQuery(), retry: false })
  const patterns = useQuery({ ...whiskersLogPatternsQuery(), retry: false })
  const projects = useQuery({ ...whiskersProjectsQuery(), retry: false })

  return useMemo(() => {
    const projectById = new Map((projects.data ?? []).map((project) => [project.id, project]))
    const issueRows = issues.data?.pages.flatMap((page) => page.issues) ?? []
    const live = [
      ...issueRows.map((issue) => issueToConsoleItem(issue, projectById.get(issue.projectId))),
      ...latestReviewPerPullRequest(reviews.data ?? []).map(reviewToConsoleItem),
      ...(patterns.data ?? []).map((pattern) =>
        logPatternToConsoleItem(pattern, projectById.get(pattern.projectId)),
      ),
    ].sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
    const unreachable = issues.isError || reviews.isError

    return {
      items: live,
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
