import { cn } from '@code-whiskers/ui/lib/utils'
import { formatCompact } from '@/components/shared/stats'
import { BAND_LABEL, BAND_ORDER, BAND_SWATCH } from '../../shared/telemetry-levels'
import { formatClock } from '../../shared/telemetry-time'
import { bandTotals, type HistogramLegendProps, type HistogramTooltipProps } from './lib'

export function HistogramLegend({ volume }: HistogramLegendProps) {
  const totals = bandTotals(volume)
  return (
    <div className="flex items-center gap-3 text-2xs text-muted-foreground">
      {BAND_ORDER.map((band) => (
        <span key={band} className={cn('flex items-center gap-1.5', !totals[band] && 'opacity-50')}>
          <span aria-hidden className={cn('size-1.5 rounded-full', BAND_SWATCH[band])} />
          {BAND_LABEL[band]}
          <span className="font-mono text-foreground tabular-nums">
            {formatCompact(totals[band])}
          </span>
        </span>
      ))}
    </div>
  )
}

/** Follows the pointer over a bucket: its time slice and what each band held. */
export function HistogramTooltip({ volume, index }: HistogramTooltipProps) {
  const bucket = volume.buckets[index]
  if (!bucket) return null
  const end = new Date(bucket.start.getTime() + volume.stepMs)
  const left = ((index + 0.5) / volume.buckets.length) * 100

  return (
    <div
      role="status"
      className="pointer-events-none absolute -top-2 z-10 flex -translate-x-1/2 -translate-y-full animate-enter flex-col gap-1 rounded-lg border border-border bg-popover px-2.5 py-1.5 shadow-overlay"
      style={{ left: `clamp(80px, ${left}%, calc(100% - 80px))` }}
    >
      <span className="whitespace-nowrap font-mono text-2xs text-muted-foreground tabular-nums">
        {formatClock(bucket.start).slice(0, 8)} – {formatClock(end).slice(0, 8)}
      </span>
      {BAND_ORDER.filter((band) => bucket[band] > 0).map((band) => (
        <span key={band} className="flex items-center gap-1.5 text-2xs">
          <span aria-hidden className={cn('size-1.5 rounded-full', BAND_SWATCH[band])} />
          <span className="flex-1 text-muted-foreground">{BAND_LABEL[band]}</span>
          <span className="font-mono tabular-nums">{bucket[band].toLocaleString()}</span>
        </span>
      ))}
    </div>
  )
}
