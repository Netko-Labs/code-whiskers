import type { PointerEvent } from 'react'
import type { WhiskersLogVolume } from '@/integrations/whiskers'
import type { LevelBand } from '../../../shared/telemetry-levels'

export type HistogramSegment = {
  band: LevelBand
  y: number
  height: number
}

export type HistogramColumn = {
  index: number
  x: number
  width: number
  total: number
  segments: HistogramSegment[]
}

export type BrushSpan = {
  start: number
  end: number
}

export type BrushState = {
  hover: number | null
  span: BrushSpan | null
  handlers: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void
    onPointerMove: (event: PointerEvent<HTMLElement>) => void
    onPointerUp: (event: PointerEvent<HTMLElement>) => void
    onPointerLeave: () => void
  }
}

export type HistogramTooltipProps = {
  volume: WhiskersLogVolume
  index: number
}

export type HistogramLegendProps = {
  volume: WhiskersLogVolume | undefined
}
