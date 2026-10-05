import { useSyncExternalStore } from 'react'
import { APPLE_PLATFORM } from '../values'

function subscribe(): () => void {
  return () => {}
}

/** Server and first paint assume ⌘; other platforms correct right after hydration. */
export function useIsMac(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => APPLE_PLATFORM.test(navigator.userAgent),
    () => true,
  )
}
