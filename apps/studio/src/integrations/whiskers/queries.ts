import { infiniteQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { fetchWhiskers, postWhiskers } from './client'
import {
  ISSUE_PAGE_SIZE,
  type IssueListParams,
  type IssuePeriod,
  type LogQuery,
  NO_PROJECT,
  type OverviewParams,
  type ProjectScope,
  WHISKERS_QUERY_KEY,
  type WhiskersIssuePage,
  whiskersEventDetailSchema,
  whiskersHotspotListSchema,
  whiskersInstanceSchema,
  whiskersIssueDetailSchema,
  whiskersIssueEventListSchema,
  whiskersIssuePageSchema,
  whiskersLogListSchema,
  whiskersLogPatternListSchema,
  whiskersOverviewSchema,
  whiskersReleaseListSchema,
  whiskersReviewDetailSchema,
  whiskersReviewListSchema,
  whiskersServiceListSchema,
  whiskersSpanListSchema,
  whiskersTraceListSchema,
} from './lib'

/** An empty project scope still reads the repository's reviews, so it asks for no project by name. */
export const whiskersOverviewQuery = ({ range, projectIds, repository }: OverviewParams) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'overview', range, scopeKey(projectIds), repository ?? null],
    queryFn: () =>
      fetchWhiskers(
        `/overview${params({
          range,
          projectId: projectIds && (projectIds.join(',') || NO_PROJECT),
          repository: repository ?? undefined,
        })}`,
        whiskersOverviewSchema,
      ),
    placeholderData: keepPreviousData,
  })

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

const EMPTY_ISSUE_PAGE: WhiskersIssuePage = { issues: [], nextCursor: null, total: 0 }

function issueListKey({ projectIds, ids, limit, ...filters }: IssueListParams) {
  return { ...filters, scope: scopeKey(projectIds), ids: ids?.join(',') ?? null }
}

function readIssuePage(query: IssueListParams, cursor: string | null, limit: number) {
  if (query.projectIds?.length === 0 || query.ids?.length === 0) {
    return Promise.resolve(EMPTY_ISSUE_PAGE)
  }
  const search = params({
    projectId: query.projectIds?.join(','),
    status: query.status,
    environment: query.environment,
    release: query.release,
    q: query.q,
    sort: query.sort,
    ids: query.ids?.join(','),
    regressed: query.isRegressed ? 'true' : undefined,
    cursor: cursor ?? undefined,
    limit: String(limit),
  })
  return fetchWhiskers(`/issues${search}`, whiskersIssuePageSchema)
}

/** Cursor pages of issues; a filter change keeps the old rows on screen until the new ones land. */
export const whiskersIssuesQuery = (query: IssueListParams) =>
  infiniteQueryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'issues', 'list', issueListKey(query)],
    queryFn: ({ pageParam }) => readIssuePage(query, pageParam, query.limit ?? ISSUE_PAGE_SIZE),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
    placeholderData: keepPreviousData,
  })

/** Only the `total`: one row is the cheapest page that still carries it. */
export const whiskersIssueTotalQuery = (query: IssueListParams) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'issues', 'total', issueListKey(query)],
    queryFn: () => readIssuePage(query, null, 1).then((page) => page.total),
  })

export const whiskersIssueQuery = (issueId: string, period: IssuePeriod) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'issue', issueId, period],
    queryFn: () =>
      fetchWhiskers(
        `/issues/${encodeURIComponent(issueId)}${params({ period })}`,
        whiskersIssueDetailSchema,
      ),
    placeholderData: keepPreviousData,
  })

export const whiskersIssueEventsQuery = (issueId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'issue-events', issueId],
    queryFn: () =>
      fetchWhiskers(`/issues/${encodeURIComponent(issueId)}/events`, whiskersIssueEventListSchema),
  })

/** `eventId` is a row id, or `latest` / `oldest`. */
export const whiskersIssueEventQuery = (issueId: string, eventId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'issue-event', issueId, eventId],
    queryFn: () =>
      fetchWhiskers(
        `/issues/${encodeURIComponent(issueId)}/events/${encodeURIComponent(eventId)}`,
        whiskersEventDetailSchema,
      ),
    placeholderData: keepPreviousData,
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
