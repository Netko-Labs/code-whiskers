import { type KeyboardEvent, type RefObject, useCallback, useEffect } from 'react'
import { isTyping } from '@/shared/dom-events'
import { nextIndex, rowsIn, syncTabStops } from '../utils'
import { ROVING_KEYS } from '../values'

/** ↑↓ / j k / Home End move focus between rows; Tab leaves the list from wherever you are. */
export function useRovingFocus(
  ref: RefObject<HTMLElement | null>,
): (event: KeyboardEvent<HTMLElement>) => void {
  useEffect(() => {
    if (ref.current) syncTabStops(rowsIn(ref.current))
  })

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const move = ROVING_KEYS[event.key]
      const container = ref.current
      if (!move || !container || isTyping(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const rows = rowsIn(container)
      const current = rows.findIndex((row) => row.contains(document.activeElement))
      const target = rows[nextIndex(current, move, rows.length)]
      if (!target) return
      event.preventDefault()
      syncTabStops(rows, target)
      target.focus()
      target.scrollIntoView({ block: 'nearest' })
    },
    [ref],
  )
}
