import type { NumberFormat, SparkBar, SparklineGeometry } from './types'

const STROKE_INSET = 1.5

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/** Scales into the box with a stroke-wide inset so the line never clips at the edges. */
export function sparklineGeometry(
  values: number[],
  width: number,
  height: number,
): SparklineGeometry {
  if (values.length === 0) return { line: '', area: '' }
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const step = values.length > 1 ? (width - STROKE_INSET * 2) / (values.length - 1) : 0
  const usable = height - STROKE_INSET * 2
  const points = values.map((value, index) => {
    const x = round(STROKE_INSET + index * step)
    const y = round(
      max === min ? height / 2 : STROKE_INSET + usable - ((value - min) / span) * usable,
    )
    return `${x},${y}`
  })
  const line = `M${points.join(' L')}`
  const lastX = round(STROKE_INSET + (values.length - 1) * step)
  return { line, area: `${line} L${lastX},${height} L${STROKE_INSET},${height} Z` }
}

/** Zero still gets a 1px stub so an empty hour reads as "nothing", not "missing". */
export function sparkBars(values: number[], width: number, height: number, gap = 1): SparkBar[] {
  if (values.length === 0) return []
  const max = Math.max(...values) || 1
  const barWidth = Math.max(1, (width - gap * (values.length - 1)) / values.length)
  return values.map((value, index) => {
    const barHeight = Math.max(1, round((value / max) * height))
    return {
      x: round(index * (barWidth + gap)),
      y: round(height - barHeight),
      width: round(barWidth),
      height: barHeight,
    }
  })
}

export const formatCompact: NumberFormat = (value) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export const formatInteger: NumberFormat = (value) => Math.round(value).toLocaleString('en')
