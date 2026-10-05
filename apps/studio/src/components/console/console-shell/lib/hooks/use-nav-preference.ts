import { useEffect } from 'react'
import { NAV_COLLAPSED_STORAGE_KEY } from '../../../lib'
import { useConsoleStore } from '../../../use-console-store'

/** Read after mount: the server renders the expanded sidebar and the first paint must match. */
export function useNavPreference(): void {
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(NAV_COLLAPSED_STORAGE_KEY)
      if (stored !== null) useConsoleStore.getState().setNavCollapsed(stored === '1')
    } catch {
      // Storage can be refused; the default layout stands.
    }
  }, [])
}
