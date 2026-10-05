import type { RovingMove } from './types'
import { FOCUSABLE_ROW, ROW_SELECTOR } from './values'

/** Clamps at both ends: Linear-style lists stop at the edge rather than wrap. */
export function nextIndex(current: number, move: RovingMove, length: number): number {
  if (length === 0) return -1
  if (move === 'first') return 0
  if (move === 'last') return length - 1
  if (current < 0) return move === 1 ? 0 : length - 1
  return Math.min(length - 1, Math.max(0, current + move))
}

export function rowsIn(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(ROW_SELECTOR)].filter((row) =>
    row.matches(FOCUSABLE_ROW),
  )
}

/** One tab stop per list: the focused row, else the selected one, else the first. */
export function syncTabStops(rows: HTMLElement[], active?: HTMLElement): void {
  const focused = rows.find((row) => row.contains(document.activeElement))
  const selected = rows.find((row) => row.dataset.selected === 'true')
  const stop = active ?? focused ?? selected ?? rows[0]
  for (const row of rows) row.tabIndex = row === stop ? 0 : -1
}
