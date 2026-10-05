import { infiniteQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { fetchWhiskers, postWhiskers } from './client'
import {
  ISSUE_PAGE_SIZE,
  type IssueListParams,
  type IssuePeriod,
  NO_PROJECT,
  type OverviewParams,
  type ProjectScope,
  params,
  scoped,
  scopeKey,
  WHISKERS_QUERY_KEY,
  type WhiskersIssuePage,
  whiskersEventDetailSchema,
  whiskersHotspotListSchema,
  whiskersInstanceSchema,
  whiskersIssueDetailSchema,
  whiskersIssueEventListSchema,
  whiskersIssuePageSchema,
  whiskersOverviewSchema,
  whiskersPullRequestReviewsSchema,
  whiskersReleaseListSchema,
  whiskersReviewDetailSchema,
  whiskersReviewListSchema,
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

/**
 * Under `reviews`, so the realtime `reviews` topic refreshes the open page with the list. Moving
 * between pushes of one pull request keeps the thread on screen while the next id loads.
 */
export const whiskersPullRequestReviewsQuery = (reviewId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'reviews', reviewId, 'pull-request'],
    queryFn: () =>
      fetchWhiskers(
        `/reviews/${encodeURIComponent(reviewId)}/pull-request`,
        whiskersPullRequestReviewsSchema,
      ),
    placeholderData: keepPreviousData,
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

export const rerunReview = (target: { owner: string; repo: string; prNumber: number }) =>
  postWhiskers('/reviews/rerun', target, z.object({ queued: z.boolean() }))
