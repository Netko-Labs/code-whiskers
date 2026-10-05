import { type PointerEvent, useState } from 'react'
import type { BrushSpan, BrushState } from '../types'
import { bucketAt } from '../utils'

function indexOf(event: PointerEvent<HTMLElement>, count: number): number {
  const rect = event.currentTarget.getBoundingClientRect()
  return bucketAt(event.clientX - rect.left, rect.width, count)
}

/** Drag across buckets to select a span; a click selects the one bucket under the pointer. */
export function useBrush(count: number, onCommit: (span: BrushSpan) => void): BrushState {
  const [hover, setHover] = useState<number | null>(null)
  const [span, setSpan] = useState<BrushSpan | null>(null)

  return {
    hover,
    span,
    handlers: {
      onPointerDown: (event) => {
        if (event.button !== 0 || count === 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        const index = indexOf(event, count)
        setSpan({ start: index, end: index })
      },
      onPointerMove: (event) => {
        const index = indexOf(event, count)
        setHover(index)
        if (span) setSpan({ ...span, end: index })
      },
      onPointerUp: (event) => {
        if (!span) return
        event.currentTarget.releasePointerCapture(event.pointerId)
        setSpan(null)
        onCommit({ ...span, end: indexOf(event, count) })
      },
      onPointerLeave: () => setHover(null),
    },
  }
}
