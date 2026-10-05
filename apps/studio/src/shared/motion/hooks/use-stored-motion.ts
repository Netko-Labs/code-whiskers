import { useEffect } from 'react'
import { MOTION_ATTRIBUTE, MOTION_STORAGE_KEY } from '../constants'
import { parseMotionPreference } from '../utils'

/** Restores the saved motion setting once per session; until then the OS setting applies. */
export function useStoredMotion(): void {
  useEffect(() => {
    try {
      const stored = parseMotionPreference(window.localStorage.getItem(MOTION_STORAGE_KEY))
      document.documentElement.setAttribute(MOTION_ATTRIBUTE, stored)
    } catch {
      // Storage can be refused; the OS setting stands.
    }
  }, [])
}
