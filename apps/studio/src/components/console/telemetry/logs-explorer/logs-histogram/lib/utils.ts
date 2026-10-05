import type { WhiskersLogVolume, WhiskersVolumeBucket } from '@/integrations/whiskers'
import { BAND_ORDER, type LevelBand } from '../../../shared/telemetry-levels'
import type { BrushSpan, HistogramColumn } from './types'
import { BAR_GAP, CHART_HEIGHT, COLUMN_WIDTH } from './values'

export function bucketTotal(bucket: WhiskersVolumeBucket): number {
  return BAND_ORDER.reduce((sum, band) => sum + bucket[band], 0)
}

export function bandTotals(volume: WhiskersLogVolume | undefined): Record<LevelBand, number> {
  const totals: Record<LevelBand, number> = { error: 0, warn: 0, info: 0, debug: 0 }
  for (const bucket of volume?.buckets ?? []) {
    for (const band of BAND_ORDER) totals[band] += bucket[band]
  }
  return totals
}

/** Stacked columns in viewBox units; errors sit on the axis, an empty bucket keeps a 1px stub. */
export function histogramColumns(buckets: WhiskersVolumeBucket[]): HistogramColumn[] {
  const peak = Math.max(1, ...buckets.map(bucketTotal))
  return buckets.map((bucket, index) => {
    let top = CHART_HEIGHT
    const segments = BAND_ORDER.filter((band) => bucket[band] > 0).map((band) => {
      const height = (bucket[band] / peak) * CHART_HEIGHT
      top -= height
      return { band, y: top, height }
    })
    return {
      index,
      x: index * COLUMN_WIDTH + BAR_GAP / 2,
      width: COLUMN_WIDTH - BAR_GAP,
      total: bucketTotal(bucket),
      segments,
    }
  })
}

/** Inclusive bucket span → the exact window it covers, for pinning the explorer to it. */
export function brushWindow(volume: WhiskersLogVolume, span: BrushSpan) {
  const first = Math.max(0, Math.min(span.start, span.end))
  const last = Math.min(volume.buckets.length - 1, Math.max(span.start, span.end))
  const start = volume.buckets[first]?.start.getTime() ?? volume.from.getTime()
  const end = (volume.buckets[last]?.start.getTime() ?? volume.from.getTime()) + volume.stepMs
  return { from: start, to: Math.min(end, Math.max(volume.to.getTime(), start + 1)) }
}

/** Which bucket a pointer at `offsetX` of `width` pixels sits over. */
export function bucketAt(offsetX: number, width: number, count: number): number {
  if (width <= 0 || count === 0) return 0
  return Math.min(count - 1, Math.max(0, Math.floor((offsetX / width) * count)))
}
