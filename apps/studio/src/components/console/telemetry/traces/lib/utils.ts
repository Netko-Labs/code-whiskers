import type { ProjectScope, TraceListParams, WhiskersTrace } from '@/integrations/whiskers'
import { parseRangeSearch, searchNumber, searchText } from '../../shared/telemetry-time'
import type { DurationBar, TraceSearch } from './types'

export function cleanTraceSearch(search: TraceSearch): TraceSearch {
  return Object.fromEntries(
    Object.entries(search).filter(
      ([, value]) => value !== undefined && value !== false && value !== '',
    ),
  ) as TraceSearch
}

/** Legacy `?tab=1` meant "with errors" and `?tab=2` "slowest". */
export function parseTraceSearch(input: Record<string, unknown>): TraceSearch {
  const tab = Number(input.tab)
  return cleanTraceSearch({
    ...parseRangeSearch(input),
    q: searchText(input.q),
    service: searchText(input.service),
    errors: input.errors === true || input.errors === 'true' || tab === 1 || undefined,
    minMs: searchNumber(input.minMs),
    sort: input.sort === 'slowest' || tab === 2 ? 'slowest' : undefined,
  })
}

export function toTraceParams(search: TraceSearch, projectIds: ProjectScope): TraceListParams {
  return {
    projectIds,
    service: search.service,
    q: search.q,
    hasErrors: search.errors,
    minMs: search.minMs,
    sort: search.sort ?? 'recent',
  }
}

/** Nearest-rank p95 of the root durations shown; 0 for an empty list. */
export function p95Of(traces: WhiskersTrace[]): number {
  if (traces.length === 0) return 0
  const sorted = traces.map((trace) => trace.durationMs).sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)] ?? 0
}

/** The bar's scale leaves headroom past p95 so typical traces read as typical, not full. */
export function durationScale(traces: WhiskersTrace[], p95: number): number {
  const slowest = Math.max(0, ...traces.map((trace) => trace.durationMs))
  return Math.max(1, Math.min(slowest, p95 * 2))
}

export function durationBar(durationMs: number, scaleMs: number, p95Ms: number): DurationBar {
  return {
    percent: Math.max(2, Math.min(100, (durationMs / scaleMs) * 100)),
    p95Percent: Math.min(100, (p95Ms / scaleMs) * 100),
    isSlow: p95Ms > 0 && durationMs > p95Ms,
  }
}

export function isTraceSearchFiltered({ q, service, errors, minMs }: TraceSearch): boolean {
  return !!(q || service || errors || minMs)
}

export function suggestTraceViewName(search: TraceSearch): string {
  const parts = [search.service, search.errors && 'with errors', search.q && `“${search.q}”`]
  return parts.filter(Boolean).join(' · ') || 'All traces'
}
