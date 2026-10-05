import { Skeleton } from '@code-whiskers/ui/components/skeleton'
import { cn } from '@code-whiskers/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { whiskersLogVolumeQuery } from '@/integrations/whiskers'
import { BAND_FILL } from '../../shared/telemetry-levels'
import { formatClock } from '../../shared/telemetry-time'
import { type ExplorerPartProps, VOLUME_BUCKETS } from '../lib'
import { HistogramLegend, HistogramTooltip } from './histogram-parts'
import { brushWindow, CHART_HEIGHT, COLUMN_WIDTH, histogramColumns, useBrush } from './lib'

/** Lines per bucket, stacked by level. Drag across it to pin the explorer to that slice. */
export function LogsHistogram({ explorer }: ExplorerPartProps) {
  const { data: volume, isPending } = useQuery({
    ...whiskersLogVolumeQuery(explorer.filter, explorer.window, VOLUME_BUCKETS),
    retry: false,
  })
  const count = volume?.buckets.length ?? 0
  const brush = useBrush(count, (span) => {
    if (volume) explorer.update({ ...brushWindow(volume, span), range: undefined, live: undefined })
  })
  const columns = histogramColumns(volume?.buckets ?? [])
  const selection = brush.span && {
    left: (Math.min(brush.span.start, brush.span.end) / count) * 100,
    width: ((Math.abs(brush.span.end - brush.span.start) + 1) / count) * 100,
  }

  return (
    <section
      aria-label="Log volume"
      className="flex flex-col gap-2 border-border border-b px-gutter py-3"
    >
      <HistogramLegend volume={volume} />
      {isPending ? (
        <Skeleton className="h-14 w-full rounded-md" />
      ) : (
        <div
          {...brush.handlers}
          className="relative h-14 cursor-crosshair touch-none select-none"
          title="Drag to zoom into a slice"
        >
          <svg
            aria-hidden
            viewBox={`0 0 ${count * COLUMN_WIDTH || 1} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="size-full overflow-visible"
          >
            {columns.map((column) => (
              <g
                key={column.index}
                className={cn(
                  'transition-opacity duration-fast',
                  brush.hover !== null && brush.hover !== column.index && 'opacity-60',
                )}
              >
                {column.total === 0 ? (
                  <rect
                    x={column.x}
                    y={CHART_HEIGHT - 1}
                    width={column.width}
                    height={1}
                    className="fill-border"
                  />
                ) : (
                  column.segments.map((segment) => (
                    <rect
                      key={segment.band}
                      x={column.x}
                      y={segment.y}
                      width={column.width}
                      height={Math.max(0.5, segment.height)}
                      className={BAND_FILL[segment.band]}
                    />
                  ))
                )}
              </g>
            ))}
          </svg>
          {selection && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 rounded-sm border border-ring/60 bg-ring/10"
              style={{ left: `${selection.left}%`, width: `${selection.width}%` }}
            />
          )}
          {volume && brush.hover !== null && !brush.span && (
            <HistogramTooltip volume={volume} index={brush.hover} />
          )}
        </div>
      )}
      {volume && count > 0 && (
        <div className="flex justify-between font-mono text-2xs text-faint tabular-nums">
          <span>{formatClock(volume.from).slice(0, 5)}</span>
          <span>
            {formatClock(new Date((volume.from.getTime() + volume.to.getTime()) / 2)).slice(0, 5)}
          </span>
          <span>{formatClock(volume.to).slice(0, 5)}</span>
        </div>
      )}
    </section>
  )
}
