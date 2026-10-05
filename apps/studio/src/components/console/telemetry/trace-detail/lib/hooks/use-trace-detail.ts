import { useQuery } from '@tanstack/react-query'
import { whiskersTraceContextQuery, whiskersTraceQuery } from '@/integrations/whiskers'
import type { TraceDetail } from '../types'

/** Spans first; the related logs and errors fill in after, without holding the waterfall back. */
export function useTraceDetail(traceId: string): TraceDetail {
  const spans = useQuery({ ...whiskersTraceQuery(traceId), retry: false })
  const context = useQuery({ ...whiskersTraceContextQuery(traceId), retry: false })

  return {
    spans: spans.data ?? [],
    context: context.data,
    isPending: spans.isPending,
    isError: spans.isError,
    retry: () => void spans.refetch(),
  }
}
