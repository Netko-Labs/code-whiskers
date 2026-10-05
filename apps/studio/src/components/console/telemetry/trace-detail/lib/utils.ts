import type { WhiskersSpan } from '@/integrations/whiskers'
import { formatDuration, searchText } from '../../shared/telemetry-time'
import type { AxisTick, TraceDetailSearch, Waterfall, WaterfallRow } from './types'
import { AXIS_TICKS, SERVICE_FILLS } from './values'

function endOf(span: WhiskersSpan): number {
  return span.startTime.getTime() + span.durationMs
}

/**
 * Depth-first span tree on one time axis. A span whose parent never arrived is drawn as a root
 * rather than dropped; a collapsed span hides its subtree.
 */
export function buildWaterfall(
  spans: WhiskersSpan[],
  collapsed: ReadonlySet<string> = new Set(),
): Waterfall {
  if (spans.length === 0) return { rows: [], startMs: 0, durationMs: 0, services: [], errors: 0 }
  const startMs = Math.min(...spans.map((span) => span.startTime.getTime()))
  const durationMs = Math.max(1, Math.max(...spans.map(endOf)) - startMs)
  const ids = new Set(spans.map((span) => span.spanId))
  const children = new Map<string | null, WhiskersSpan[]>()
  for (const span of spans) {
    const parent = span.parentSpanId && ids.has(span.parentSpanId) ? span.parentSpanId : null
    children.set(parent, [...(children.get(parent) ?? []), span])
  }
  for (const list of children.values()) {
    list.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  const services: string[] = []
  const rows: WaterfallRow[] = []
  const visit = (span: WhiskersSpan, depth: number) => {
    if (!services.includes(span.service)) services.push(span.service)
    const offsetMs = span.startTime.getTime() - startMs
    const kids = children.get(span.spanId) ?? []
    rows.push({
      span,
      depth,
      offsetMs,
      startPercent: (offsetMs / durationMs) * 100,
      widthPercent: Math.max(0.3, (span.durationMs / durationMs) * 100),
      childCount: kids.length,
      colorIndex: services.indexOf(span.service) % SERVICE_FILLS.length,
    })
    if (collapsed.has(span.spanId)) return
    for (const child of kids) visit(child, depth + 1)
  }
  for (const root of children.get(null) ?? []) visit(root, 0)

  return {
    rows,
    startMs,
    durationMs,
    services,
    errors: spans.filter((span) => span.status === 'error').length,
  }
}

/** Evenly spaced labels across the trace, from zero to its full duration. */
export function axisTicks(durationMs: number, count = AXIS_TICKS): AxisTick[] {
  return Array.from({ length: count }, (_, index) => {
    const fraction = index / (count - 1)
    return { percent: fraction * 100, label: formatDuration(durationMs * fraction) }
  })
}

export function rootOf(spans: WhiskersSpan[]): WhiskersSpan | undefined {
  const ids = new Set(spans.map((span) => span.spanId))
  return (
    spans.find((span) => !span.parentSpanId) ??
    spans.find((span) => !span.parentSpanId || !ids.has(span.parentSpanId)) ??
    spans[0]
  )
}

export function serviceFill(colorIndex: number): string {
  return SERVICE_FILLS[colorIndex % SERVICE_FILLS.length] ?? 'bg-chart-1'
}

export function parseTraceDetailSearch(input: Record<string, unknown>): TraceDetailSearch {
  const span = searchText(input.span)
  return span ? { span } : {}
}
