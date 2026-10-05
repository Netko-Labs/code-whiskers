import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { recentTriageActivityQuery } from '@/integrations/studio-api'
import { whiskersIssuesQuery, whiskersReviewsQuery } from '@/integrations/whiskers'
import type { ActivityFeed } from '../types'
import { activityIssueIds, toFeedEntries } from '../utils'
import { FEED_LIMIT } from '../values'

/**
 * Studio's decisions and whiskers' regressions, plus finished reviews. Issue titles live in
 * whiskers, so the issues the activity names are read once by id.
 */
export function useActivityFeed(): ActivityFeed {
  const activity = useQuery({ ...recentTriageActivityQuery(), retry: false })
  const reviews = useQuery({ ...whiskersReviewsQuery(), retry: false })
  const ids = activityIssueIds(activity.data ?? [])
  const issues = useInfiniteQuery({
    ...whiskersIssuesQuery({ status: 'all', sort: 'last_seen', ids, limit: ids.length || 1 }),
    enabled: ids.length > 0,
    retry: false,
  })

  return useMemo(() => {
    const titles = new Map(
      (issues.data?.pages ?? []).flatMap((page) =>
        page.issues.map((issue) => [issue.id, issue.title]),
      ),
    )
    return {
      entries: toFeedEntries(activity.data ?? [], reviews.data ?? [], titles, FEED_LIMIT),
      isLoading: activity.isLoading || reviews.isLoading,
    }
  }, [activity.data, activity.isLoading, reviews.data, reviews.isLoading, issues.data])
}
