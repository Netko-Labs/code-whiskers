import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { whiskersIssuesQuery, whiskersReviewsQuery } from '@/integrations/whiskers'
import type { ConsoleItem } from '../../console-model'
import { issueToConsoleItem, latestReviewPerPullRequest, reviewToConsoleItem } from '../utils'
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

  return useMemo(() => {
    const live = [
      ...(issues.data ?? []).map(issueToConsoleItem),
      ...latestReviewPerPullRequest(reviews.data ?? []).map(reviewToConsoleItem),
    ]
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
  ])
}
