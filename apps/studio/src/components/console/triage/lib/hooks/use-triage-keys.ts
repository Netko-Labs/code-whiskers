import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { isTyping, useDocumentKeydown } from '@/shared/dom-events'
import type { ConsoleItem, TriageBucket } from '../../../shared/console-model'

/** j / k walk the visible list, enter opens the selected item in full; never while typing. */
export function useTriageKeys(items: ConsoleItem[], selectedId: string, bucket: TriageBucket) {
  const navigate = useNavigate()
  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      if (event.target instanceof HTMLElement && event.target.closest('[role="menu"]')) return
      const index = items.findIndex((item) => item.id === selectedId)
      if (event.key === 'Enter') {
        const item = items[index]
        if (!item || (event.target instanceof HTMLElement && event.target.closest('a, button'))) {
          return
        }
        event.preventDefault()
        if (item.issue) {
          void navigate({ to: '/console/issues/$issueId', params: { issueId: item.issue.id } })
        } else if (item.kind === 'review' && item.url) {
          window.open(item.url, '_blank', 'noopener')
        } else if (item.kind === 'alert' && item.alert) {
          void navigate({ to: '/console/alerts/$ruleId', params: { ruleId: item.alert.id } })
        } else {
          void navigate({ to: '/console/$section', params: { section: 'live-logs' } })
        }
        return
      }
      const step = event.key === 'j' ? 1 : event.key === 'k' ? -1 : 0
      if (step === 0 || items.length === 0) return
      const next = items[Math.min(items.length - 1, Math.max(0, index + step))]
      if (!next || next.id === selectedId) return
      event.preventDefault()
      void navigate({
        to: '/console/triage/$bucket',
        params: { bucket },
        search: (prev) => ({ ...prev, sel: next.id }),
        replace: true,
      })
    },
    [items, selectedId, bucket, navigate],
  )
  useDocumentKeydown(onKey)
}
