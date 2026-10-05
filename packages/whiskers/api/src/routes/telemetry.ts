import {
  LogFilterSchema,
  LogQuerySchema,
  LogVolumeQuerySchema,
  ProjectScopeSchema,
  ServiceStatsQuerySchema,
  TraceParamsSchema,
  TraceQuerySchema,
} from '@code-whiskers/whiskers-domain'
import {
  getLogPatterns,
  getLogs,
  getLogVolume,
  getServiceStats,
  getServices,
  getTrace,
  getTraceContext,
  getTraces,
} from '@code-whiskers/whiskers-service'
import { Elysia } from 'elysia'
import { logFilterOf, projectIdsOf } from '../shared'

/** Logs, traces and services read back out of what OTLP ingest stored. */
export const telemetryRoutes = new Elysia({ name: 'telemetry', prefix: '/v1' })
  // (｀-´)> log lines, newest first; `before` pages back by id
  .get('/logs', { query: LogQuerySchema }, ({ query }) =>
    getLogs({ ...logFilterOf(query), before: query.before, limit: query.limit }),
  )
  // (｀-´)> lines per bucket and level: the histogram over the explorer
  .get('/logs/volume', { query: LogVolumeQuerySchema }, ({ query }) =>
    getLogVolume(logFilterOf(query), query.buckets),
  )
  // (｀-´)> lines grouped by shape; error and fatal unless `levels` says otherwise
  .get('/log-patterns', { query: LogFilterSchema }, ({ query }) =>
    getLogPatterns(logFilterOf(query)),
  )
  // (｀-´)> traces in the window, one row each
  .get('/traces', { query: TraceQuerySchema }, ({ query }) =>
    getTraces({
      projectIds: projectIdsOf(query.projectId),
      service: query.service,
      query: query.q,
      hasErrors: query.errors === 'true',
      minMs: query.minMs,
      sort: query.sort,
      from: query.from,
      to: query.to,
    }),
  )
  // (｀-´)> one trace's spans, and what else it left behind
  .get('/traces/:traceId', { params: TraceParamsSchema }, ({ params }) => getTrace(params.traceId))
  .get('/traces/:traceId/context', { params: TraceParamsSchema }, ({ params }) =>
    getTraceContext(params.traceId),
  )
  // (｀-´)> every service that logged or traced today
  .get('/services', { query: ProjectScopeSchema }, ({ query }) =>
    getServices(projectIdsOf(query.projectId)),
  )
  // (｀-´)> request rate, errors and latency per service over the window
  .get('/services/stats', { query: ServiceStatsQuerySchema }, ({ query }) =>
    getServiceStats(
      { projectIds: projectIdsOf(query.projectId), from: query.from, to: query.to },
      query.buckets,
    ),
  )
