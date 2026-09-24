import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { fetchWhiskers, postWhiskers } from './client'
import {
  type LogQuery,
  type ProjectScope,
  WHISKERS_QUERY_KEY,
  whiskersEventDetailSchema,
  whiskersHotspotListSchema,
  whiskersInstanceSchema,
  whiskersIssueListSchema,
  whiskersLogListSchema,
  whiskersLogPatternListSchema,
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

const LIVE_REFRESH_MS = 5_000

function params(values: Record<string, string | undefined>): string {
  const defined = Object.entries(values).filter((entry): entry is [string, string] => !!entry[1])
  return defined.length ? `?${new URLSearchParams(defined)}` : ''
}

/** A scope with no projects has nothing to read; answer empty instead of asking for everything. */
function scoped<T>(projectIds: ProjectScope, read: (projectId?: string) => Promise<T[]>) {
  if (projectIds?.length === 0) return Promise.resolve([] as T[])
  return read(projectIds?.join(','))
}

function scopeKey(projectIds: ProjectScope): string | null {
  return projectIds ? projectIds.join(',') || '-' : null
}

export const whiskersIssuesQuery = (projectIds?: ProjectScope) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'issues', scopeKey(projectIds)],
    queryFn: () =>
      scoped(projectIds, (projectId) =>
        fetchWhiskers(`/issues${params({ projectId })}`, whiskersIssueListSchema),
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

export const createWhiskersProject = (name: string, repository: string | null) =>
  postWhiskers('/projects', { name, repository }, whiskersProjectSchema)

export const setWhiskersProjectRepository = (projectId: string, repository: string | null) =>
  postWhiskers(
    `/projects/${encodeURIComponent(projectId)}/repository`,
    { repository },
    whiskersProjectSchema,
  )

export const whiskersReleasesQuery = (projectIds?: ProjectScope) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'releases', scopeKey(projectIds)],
    queryFn: () =>
      scoped(projectIds, (projectId) =>
        fetchWhiskers(`/releases${params({ projectId })}`, whiskersReleaseListSchema),
      ),
  })

export const whiskersLogsQuery = ({ projectIds, ...query }: LogQuery) =>
  queryOptions({
    queryKey: [
      WHISKERS_QUERY_KEY,
      'logs',
      scopeKey(projectIds),
      query.service ?? null,
      query.level ?? null,
      query.q ?? null,
    ],
    queryFn: () =>
      scoped(projectIds, (projectId) =>
        fetchWhiskers(`/logs${params({ ...query, projectId })}`, whiskersLogListSchema),
      ),
    refetchInterval: LIVE_REFRESH_MS,
  })

export const whiskersTracesQuery = (service?: string, projectIds?: ProjectScope) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'traces', scopeKey(projectIds), service ?? null],
    queryFn: () =>
      scoped(projectIds, (projectId) =>
        fetchWhiskers(`/traces${params({ service, projectId })}`, whiskersTraceListSchema),
      ),
  })

export const whiskersTraceQuery = (traceId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'trace', traceId],
    queryFn: () => fetchWhiskers(`/traces/${encodeURIComponent(traceId)}`, whiskersSpanListSchema),
  })

export const whiskersServicesQuery = (projectIds?: ProjectScope) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'services', scopeKey(projectIds)],
    queryFn: () =>
      scoped(projectIds, (projectId) =>
        fetchWhiskers(`/services${params({ projectId })}`, whiskersServiceListSchema),
      ),
  })

export const whiskersLatestEventQuery = (issueId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'latest-event', issueId],
    queryFn: () => fetchWhiskers(`/issues/${issueId}/latest-event`, whiskersEventDetailSchema),
  })

export const whiskersLogPatternsQuery = (projectIds?: ProjectScope) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'log-patterns', scopeKey(projectIds)],
    queryFn: () =>
      scoped(projectIds, (projectId) =>
        fetchWhiskers(`/log-patterns${params({ projectId })}`, whiskersLogPatternListSchema),
      ),
  })

export const rerunReview = (target: { owner: string; repo: string; prNumber: number }) =>
  postWhiskers('/reviews/rerun', target, z.object({ queued: z.boolean() }))
