import { useNavigate } from '@tanstack/react-router'
import { useCallback, useRef } from 'react'
import { isCombo } from '@/components/shared/kbd'
import { isTyping, useDocumentKeydown } from '@/shared/dom-events'
import { GO_SEQUENCE_MS, GO_TARGETS } from '../../../lib'
import { useConsoleStore } from '../../../use-console-store'

/** ⌘K, `?`, `[` and `g` + key. Single keys stand down while typing or with a modifier held. */
export function useGlobalShortcuts(): void {
  const navigate = useNavigate()
  const goPressedAt = useRef(0)

  const onKey = useCallback(
    (event: KeyboardEvent) => {
      const store = useConsoleStore.getState()
      if (isCombo(event, 'mod+k')) {
        event.preventDefault()
        store.setPaletteOpen(!store.isPaletteOpen)
        return
      }
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      if (store.isPaletteOpen || store.isShortcutsOpen) return

      if (event.key === '?') {
        event.preventDefault()
        store.setShortcutsOpen(true)
        return
      }
      if (event.key === '[') {
        event.preventDefault()
        store.toggleNav()
        return
      }
      if (event.key === 'g') {
        goPressedAt.current = event.timeStamp
        return
      }
      const isGoSequence = event.timeStamp - goPressedAt.current < GO_SEQUENCE_MS
      goPressedAt.current = 0
      const target = isGoSequence && GO_TARGETS.find((candidate) => candidate.key === event.key)
      if (!target) return
      event.preventDefault()
      if ('bucket' in target) {
        void navigate({ to: '/console/triage/$bucket', params: { bucket: target.bucket } })
      } else if ('section' in target) {
        void navigate({ to: '/console/$section', params: { section: target.section } })
      } else {
        void navigate({ to: target.path })
      }
    },
    [navigate],
  )

  useDocumentKeydown(onKey)
}
