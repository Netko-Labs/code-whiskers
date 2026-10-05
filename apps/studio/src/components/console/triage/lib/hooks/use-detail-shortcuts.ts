import { useCallback } from 'react'
import { isTyping, useDocumentKeydown } from '@/shared/dom-events'
import type { DetailActions } from '../types'

/** e marks the item done, s snoozes it — the two buttons at the top of the detail. */
export function useDetailShortcuts(actions: DetailActions): void {
  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      if (event.key === 'e') {
        event.preventDefault()
        actions.done()
      } else if (event.key === 's') {
        event.preventDefault()
        actions.snooze()
      }
    },
    [actions],
  )
  useDocumentKeydown(onKey)
}
