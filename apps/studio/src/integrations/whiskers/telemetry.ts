import { infiniteQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query'
import { fetchWhiskers } from './client'
import {
  LOG_PAGE_SIZE,
  type LogFilterParams,
  logFilterParams,
  type ProjectScope,
  params,
  scoped,
  scopedOr,
  scopeKey,
  type TraceListParams,
  WHISKERS_QUERY_KEY,
  type WhiskersLogVolume,
  type WhiskersServiceStatsPage,
  type WindowSpec,
  whiskersLogListSchema,
  whiskersLogPatternListSchema,
  whiskersLogVolumeSchema,
  whiskersServiceListSchema,
  whiskersServiceStatsPageSchema,
  whiskersSpanListSchema,
  whiskersTraceContextSchema,
  whiskersTraceListSchema,
  windowParams,
} from './lib'

function filterKey({ projectIds, ...filter }: LogFilterParams) {
  return [scopeKey(projectIds), filter]
}

/** Pages back by id; a live window refetches page one against a window that ends now. */
export const whiskersLogStreamQuery = (filter: LogFilterParams, window: WindowSpec) =>
  infiniteQueryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'logs', 'stream', ...filterKey(filter), window],
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) =>
      scoped(filter.projectIds, (projectId) =>
        fetchWhiskers(
          `/logs${params({
            ...logFilterParams(filter),
            ...windowParams(window),
            projectId,
            before: pageParam ? String(pageParam) : undefined,
          })}`,
          whiskersLogListSchema,
        ),
      ),
    getNextPageParam: (page) => (page.length >= LOG_PAGE_SIZE ? page.at(-1)?.id : undefined),
    placeholderData: keepPreviousData,
  })

const EMPTY_VOLUME: WhiskersLogVolume = {
  from: new Date(0),
  to: new Date(0),
  stepMs: 0,
  buckets: [],
}

export const whiskersLogVolumeQuery = (
  filter: LogFilterParams,
  window: WindowSpec,
  buckets: number,
) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'logs', 'volume', ...filterKey(filter), window, buckets],
    queryFn: () =>
      scopedOr(filter.projectIds, EMPTY_VOLUME, (projectId) =>
        fetchWhiskers(
          `/logs/volume${params({
            ...logFilterParams(filter),
            ...windowParams(window),
            projectId,
            buckets: String(buckets),
          })}`,
          whiskersLogVolumeSchema,
        ),
      ),
    placeholderData: keepPreviousData,
  })

/** The triage inbox's default: error and fatal shapes over the last day. */
export const whiskersLogPatternsQuery = (projectIds?: ProjectScope) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'log-patterns', scopeKey(projectIds)],
    queryFn: () =>
      scoped(projectIds, (projectId) =>
        fetchWhiskers(`/log-patterns${params({ projectId })}`, whiskersLogPatternListSchema),
      ),
  })

export const whiskersExplorerPatternsQuery = (filter: LogFilterParams, window: WindowSpec) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'log-patterns', 'explorer', ...filterKey(filter), window],
    queryFn: () =>
      scoped(filter.projectIds, (projectId) =>
        fetchWhiskers(
          `/log-patterns${params({
            ...logFilterParams(filter),
            ...windowParams(window),
            projectId,
          })}`,
          whiskersLogPatternListSchema,
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const whiskersTracesQuery = (
  { projectIds, ...filter }: TraceListParams,
  window: WindowSpec,
) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'traces', scopeKey(projectIds), filter, window],
    queryFn: () =>
      scoped(projectIds, (projectId) =>
        fetchWhiskers(
          `/traces${params({
            ...windowParams(window),
            projectId,
            service: filter.service,
            q: filter.q,
            errors: filter.hasErrors ? 'true' : undefined,
            minMs: filter.minMs ? String(filter.minMs) : undefined,
            sort: filter.sort,
          })}`,
          whiskersTraceListSchema,
        ),
      ),
    placeholderData: keepPreviousData,
  })

const tracePath = (traceId: string) => `/traces/${encodeURIComponent(traceId)}`

export const whiskersTraceQuery = (traceId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'trace', traceId],
    queryFn: () => fetchWhiskers(tracePath(traceId), whiskersSpanListSchema),
  })

export const whiskersTraceContextQuery = (traceId: string) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'trace', traceId, 'context'],
    queryFn: () => fetchWhiskers(`${tracePath(traceId)}/context`, whiskersTraceContextSchema),
  })

export const whiskersServicesQuery = (projectIds?: ProjectScope) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'services', scopeKey(projectIds)],
    queryFn: () =>
      scoped(projectIds, (projectId) =>
        fetchWhiskers(`/services${params({ projectId })}`, whiskersServiceListSchema),
      ),
  })

const EMPTY_STATS: WhiskersServiceStatsPage = {
  from: new Date(0),
  to: new Date(0),
  stepMs: 0,
  services: [],
}

export const whiskersServiceStatsQuery = (
  projectIds: ProjectScope,
  window: WindowSpec,
  buckets: number,
) =>
  queryOptions({
    queryKey: [WHISKERS_QUERY_KEY, 'services', 'stats', scopeKey(projectIds), window, buckets],
    queryFn: () =>
      scopedOr(projectIds, EMPTY_STATS, (projectId) =>
        fetchWhiskers(
          `/services/stats${params({
            ...windowParams(window),
            projectId,
            buckets: String(buckets),
          })}`,
          whiskersServiceStatsPageSchema,
        ),
      ),
    placeholderData: keepPreviousData,
  })
