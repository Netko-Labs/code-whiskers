import type { WhiskersSpan, WhiskersTraceContext } from '@/integrations/whiskers'

export type TraceDetailSearch = {
  span?: string
}

export type TraceDetailPageProps = {
  traceId: string
  spanId: string | undefined
}

export type WaterfallRow = {
  span: WhiskersSpan
  depth: number
  offsetMs: number
  startPercent: number
  widthPercent: number
  childCount: number
  colorIndex: number
}

export type Waterfall = {
  rows: WaterfallRow[]
  startMs: number
  durationMs: number
  services: string[]
  errors: number
}

export type AxisTick = {
  percent: number
  label: string
}

export type TraceDetail = {
  spans: WhiskersSpan[]
  context: WhiskersTraceContext | undefined
  isPending: boolean
  isError: boolean
  retry: () => void
}

export type TraceWaterfallProps = {
  spans: WhiskersSpan[]
  selectedId: string | undefined
  onSelect: (spanId: string | undefined) => void
}

export type WaterfallRowProps = {
  row: WaterfallRow
  isSelected: boolean
  isCollapsed: boolean
  onSelect: (spanId: string) => void
  onToggle: (spanId: string) => void
}

export type SpanPanelProps = {
  span: WhiskersSpan
  traceStartMs: number
  colorIndex: number
  onClose: () => void
}

export type TraceRelatedProps = {
  traceId: string
  context: WhiskersTraceContext | undefined
  window: { from: number; to: number }
}

export type ServiceLegendProps = {
  services: string[]
}
