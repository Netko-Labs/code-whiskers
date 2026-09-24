import { queryOptions } from '@tanstack/react-query'
import { fetchWhiskers, postWhiskers } from './client'
import {
  type LogQuery,
  WHISKERS_QUERY_KEY,
  whiskersHotspotListSchema,
  whiskersInstanceSchema,
  whiskersIssueListSchema,
  whiskersLogListSchema,
  whiskersOverviewSchema,
  whiskersProjectListSchema,
  whiskersProjectSchema,
  whiskersReleaseListSchema,
  whiskersReviewDetailSchema,
  whiskersReviewListSchema,
  whiskersServiceListSchema,
  whiskersSpanListSchema,
  whiskersTraceListSchema,
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

const LIVE_REFRESH_MS = 5_000

function params(values: Record<string, string | undefined>): string {
  const defined = Object.entries(values).filter((entry): entry is [string, string] => !!entry[1])
  return defined.length ? `?${new URLSearchParams(defined)}` : ''
}

export const whiskersLogsQuery = (query: LogQuery) =>
  queryOptions({
    queryKey: [
      WHISKERS_QUERY_KEY,
      'logs',
      query.service ?? null,
      query.level ?? null,
      query.q ?? null,
    ],
    queryFn: () => fetchWhiskers(`/logs${params(query)}`, whiskersLogListSchema),
    refetchInterval: LIVE_REFRESH_MS,
  })

export const whiskersTracesQuery = (service?: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'traces', service ?? null],
    queryFn: () => fetchWhiskers(`/traces${params({ service })}`, whiskersTraceListSchema),
  })

export const whiskersTraceQuery = (traceId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'trace', traceId],
    queryFn: () => fetchWhiskers(`/traces/${encodeURIComponent(traceId)}`, whiskersSpanListSchema),
  })

export const whiskersServicesQuery = () =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'services'],
    queryFn: () => fetchWhiskers('/services', whiskersServiceListSchema),
  })
