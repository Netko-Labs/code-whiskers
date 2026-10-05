import { useQuery } from '@tanstack/react-query'
import { whiskersTracesQuery } from '@/integrations/whiskers'
import { useConsoleScope } from '../../../../shared/console-scope'
import { windowSpecOf } from '../../../shared/telemetry-time'
import type { TraceSearch, TracesState } from '../types'
import { p95Of, toTraceParams } from '../utils'
import { TRACE_RANGE_FALLBACK } from '../values'

/** The window slides with now, so a trace that just finished shows up on the next realtime ping. */
export function useTraces(search: TraceSearch): TracesState {
  const scope = useConsoleScope()
  const window = windowSpecOf(search, TRACE_RANGE_FALLBACK)
  const query = useQuery({
    ...whiskersTracesQuery(toTraceParams(search, scope.projectIds), window),
    retry: false,
  })
  const traces = query.data ?? []

  return {
    traces,
    p95Ms: p95Of(traces),
    isPending: query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
    window,
  }
}
