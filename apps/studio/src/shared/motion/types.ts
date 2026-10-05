import type { MOTION_PREFERENCES } from './constants'

export type MotionPreference = (typeof MOTION_PREFERENCES)[number]

export type MotionPreferenceState = {
  preference: MotionPreference
  /** The OS asks for less motion; `system` already honours it. */
  isSystemReduced: boolean
  setPreference: (preference: MotionPreference) => void
}
