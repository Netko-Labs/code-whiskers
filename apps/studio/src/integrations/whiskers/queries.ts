import { queryOptions } from '@tanstack/react-query'
import { fetchWhiskers } from './client'
import {
  WHISKERS_QUERY_KEY,
  whiskersHotspotListSchema,
  whiskersIssueListSchema,
  whiskersOverviewSchema,
  whiskersReviewDetailSchema,
  whiskersReviewListSchema,
} from './lib'

export const whiskersOverviewQuery = () =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'overview'],
    queryFn: () => fetchWhiskers('/overview', whiskersOverviewSchema),
  })

export const whiskersIssuesQuery = (projectId?: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'issues', projectId ?? null],
    queryFn: () =>
      fetchWhiskers(
        projectId ? `/issues?projectId=${encodeURIComponent(projectId)}` : '/issues',
        whiskersIssueListSchema,
      ),
  })

export const whiskersReviewsQuery = () =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'reviews'],
    queryFn: () => fetchWhiskers('/reviews', whiskersReviewListSchema),
  })

export const whiskersReviewQuery = (reviewId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'reviews', reviewId],
    queryFn: () => fetchWhiskers(`/reviews/${reviewId}`, whiskersReviewDetailSchema),
  })

export const whiskersHotspotsQuery = () =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'hotspots'],
    queryFn: () => fetchWhiskers('/hotspots', whiskersHotspotListSchema),
  })
