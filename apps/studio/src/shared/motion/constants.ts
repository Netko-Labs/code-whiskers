export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
export const COUNT_UP_DURATION_MS = 600

export const MOTION_STORAGE_KEY = 'codewhiskers.motion'
/** `data-motion="reduce"` on <html> zeroes the motion tokens like the OS setting does. */
export const MOTION_ATTRIBUTE = 'data-motion'
export const MOTION_PREFERENCES = ['system', 'reduce'] as const
