import { useCallback, useSyncExternalStore } from 'react'
import { MOTION_ATTRIBUTE, MOTION_STORAGE_KEY } from '../constants'
import type { MotionPreference, MotionPreferenceState } from '../types'
import { readMotionPreference, readSystemReduced, subscribeMotion } from '../utils'

/** The in-app motion setting: `system` follows the OS, `reduce` stills everything regardless. */
export function useMotionPreference(): MotionPreferenceState {
  const preference = useSyncExternalStore<MotionPreference>(
    subscribeMotion,
    readMotionPreference,
    () => 'system',
  )
  const isSystemReduced = useSyncExternalStore(subscribeMotion, readSystemReduced, () => false)

  const setPreference = useCallback((next: MotionPreference) => {
    document.documentElement.setAttribute(MOTION_ATTRIBUTE, next)
    try {
      window.localStorage.setItem(MOTION_STORAGE_KEY, next)
    } catch {
      // Storage can be refused; the setting holds for this visit.
    }
  }, [])

  return { preference, isSystemReduced, setPreference }
}
