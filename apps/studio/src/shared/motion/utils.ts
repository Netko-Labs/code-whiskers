import { MOTION_ATTRIBUTE, MOTION_PREFERENCES, REDUCED_MOTION_QUERY } from './constants'
import type { MotionPreference } from './types'

export function easeOutQuart(progress: number): number {
  return 1 - (1 - progress) ** 4
}

export function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}

export function parseMotionPreference(value: string | null | undefined): MotionPreference {
  return MOTION_PREFERENCES.find((preference) => preference === value) ?? 'system'
}

export function isMotionReduced(preference: MotionPreference, isSystemReduced: boolean): boolean {
  return preference === 'reduce' || isSystemReduced
}

/** Re-renders when either the OS setting or the in-app preference changes. */
export function subscribeMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  const observer = new MutationObserver(onChange)
  query.addEventListener('change', onChange)
  observer.observe(document.documentElement, { attributeFilter: [MOTION_ATTRIBUTE] })
  return () => {
    query.removeEventListener('change', onChange)
    observer.disconnect()
  }
}

export function readMotionPreference(): MotionPreference {
  return parseMotionPreference(document.documentElement.getAttribute(MOTION_ATTRIBUTE))
}

export function readSystemReduced(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}
