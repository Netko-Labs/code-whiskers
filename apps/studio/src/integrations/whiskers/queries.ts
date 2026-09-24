import { queryOptions } from '@tanstack/react-query'
import { fetchWhiskers, postWhiskers } from './client'
import {
  WHISKERS_QUERY_KEY,
  whiskersHotspotListSchema,
  whiskersInstanceSchema,
  whiskersIssueListSchema,
  whiskersOverviewSchema,
  whiskersProjectListSchema,
  whiskersProjectSchema,
  whiskersReleaseListSchema,
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

export const whiskersInstanceQuery = () =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'instance'],
    queryFn: () => fetchWhiskers('/instance', whiskersInstanceSchema),
  })

export const whiskersProjectsQuery = () =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'projects'],
    queryFn: () => fetchWhiskers('/projects', whiskersProjectListSchema),
  })

export const createWhiskersProject = (name: string) =>
  postWhiskers('/projects', { name }, whiskersProjectSchema)

export const whiskersReleasesQuery = () =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'releases'],
    queryFn: () => fetchWhiskers('/releases', whiskersReleaseListSchema),
  })
