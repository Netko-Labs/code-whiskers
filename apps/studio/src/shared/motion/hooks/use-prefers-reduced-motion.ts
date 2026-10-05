import { useSyncExternalStore } from 'react'
import { REDUCED_MOTION_QUERY } from '../constants'

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function readPreference(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** The server renders the still version; the client upgrades only if motion is welcome. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, readPreference, () => true)
}
