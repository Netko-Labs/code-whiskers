import { cn } from '@code-whiskers/ui/lib/utils'
import { useState } from 'react'
import { axisTicks, buildWaterfall, type TraceWaterfallProps, WATERFALL_SPLIT } from './lib'
import { ServiceLegend } from './trace-parts'
import { WaterfallRow } from './waterfall-row'

/** A dark evidence pane: the span tree on one time axis, services in blues, failures in red. */
export function TraceWaterfall({ spans, selectedId, onSelect }: TraceWaterfallProps) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
  const waterfall = buildWaterfall(spans, collapsed)

  const toggle = (spanId: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (!next.delete(spanId)) next.add(spanId)
      return next
    })

  return (
    <div className="dark flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground">
      <div className="flex items-center justify-between gap-4 border-border border-b px-3 py-2">
        <ServiceLegend services={waterfall.services} />
        <span className="font-mono text-2xs text-muted-foreground tabular-nums">
          {spans.length} spans
        </span>
      </div>
      <div
        aria-hidden
        className={cn(
          'grid h-7 items-center border-border border-b text-2xs text-faint',
          WATERFALL_SPLIT,
        )}
      >
        <span className="border-rule-soft border-r px-3">Span</span>
        <div className="relative mx-3 h-full">
          {axisTicks(waterfall.durationMs).map((tick, index, ticks) => (
            <span
              key={tick.percent}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 font-mono tabular-nums',
                index === 0
                  ? ''
                  : index === ticks.length - 1
                    ? '-translate-x-full'
                    : '-translate-x-1/2',
              )}
              style={{ left: `${tick.percent}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>
      <div role="list" aria-label="Spans" className="relative">
        {waterfall.rows.map((row) => (
          <WaterfallRow
            key={row.span.spanId}
            row={row}
            isSelected={row.span.spanId === selectedId}
            isCollapsed={collapsed.has(row.span.spanId)}
            onSelect={(spanId) => onSelect(spanId === selectedId ? undefined : spanId)}
            onToggle={toggle}
          />
        ))}
      </div>
    </div>
  )
}
