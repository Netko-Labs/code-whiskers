import { useSyncExternalStore } from 'react'
import { isMotionReduced, readMotionPreference, readSystemReduced, subscribeMotion } from '../utils'

function readReduced(): boolean {
  return isMotionReduced(readMotionPreference(), readSystemReduced())
}

/** The server renders the still version; the client upgrades only if motion is welcome. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, readReduced, () => true)
}
