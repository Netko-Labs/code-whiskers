import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useDocumentKeydown } from '@/shared/dom-events'
import type { ConsoleItem, TriageBucket } from '../../../shared/console-model'

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/** j / k walk the visible list; ignored while the user is typing anywhere. */
export function useTriageKeys(items: ConsoleItem[], selectedId: string, bucket: TriageBucket) {
  const navigate = useNavigate()
  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      const step = event.key === 'j' ? 1 : event.key === 'k' ? -1 : 0
      if (step === 0 || items.length === 0) return
      const index = items.findIndex((item) => item.id === selectedId)
      const next = items[Math.min(items.length - 1, Math.max(0, index + step))]
      if (!next || next.id === selectedId) return
      event.preventDefault()
      navigate({
        to: '/console/triage/$bucket',
        params: { bucket },
        search: (prev) => ({ ...prev, sel: next.id }),
      })
    },
    [items, selectedId, bucket, navigate],
  )
  useDocumentKeydown(onKey)
}
