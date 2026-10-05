import type { WhiskersTrace, WindowSpec } from '@/integrations/whiskers'
import type { RangeSearch } from '../../shared/telemetry-time'

export type TraceSearch = RangeSearch & {
  q?: string
  service?: string
  errors?: boolean
  minMs?: number
  sort?: 'slowest'
}

export type TracesPageProps = {
  search: TraceSearch
}

export type TracesState = {
  traces: WhiskersTrace[]
  p95Ms: number
  isPending: boolean
  isError: boolean
  retry: () => void
  window: WindowSpec
}

export type TraceUpdate = (patch: Partial<TraceSearch>) => void

export type TracesToolbarProps = {
  search: TraceSearch
  update: TraceUpdate
}

export type TraceRowProps = {
  trace: WhiskersTrace
  scaleMs: number
  p95Ms: number
}

export type DurationBar = {
  percent: number
  p95Percent: number
  isSlow: boolean
}
