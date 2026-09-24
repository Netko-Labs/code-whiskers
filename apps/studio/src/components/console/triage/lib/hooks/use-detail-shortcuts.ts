import { useCallback } from 'react'
import { useDocumentKeydown } from '@/shared/dom-events'
import type { DetailActions } from '../types'
import { isTyping } from '../utils'

/** e runs the primary action, s the secondary — the two buttons at the top of the detail. */
export function useDetailShortcuts(actions: DetailActions): void {
  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      if (event.key === 'e') {
        event.preventDefault()
        actions.onPrimary()
      } else if (event.key === 's') {
        event.preventDefault()
        actions.onSecondary()
      }
    },
    [actions],
  )
  useDocumentKeydown(onKey)
}
