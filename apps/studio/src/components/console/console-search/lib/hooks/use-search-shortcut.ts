import { useCallback } from 'react'
import { useDocumentKeydown } from '@/shared/dom-events'
import { useConsoleStore } from '../../../use-console-store'

export function useSearchShortcut(): void {
  const toggle = useCallback((event: KeyboardEvent) => {
    if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
    event.preventDefault()
    const { isSearchOpen, setSearchOpen } = useConsoleStore.getState()
    setSearchOpen(!isSearchOpen)
  }, [])
  useDocumentKeydown(toggle)
}
