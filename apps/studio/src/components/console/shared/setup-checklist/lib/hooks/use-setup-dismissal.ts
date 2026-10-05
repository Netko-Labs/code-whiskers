import { useCallback, useEffect, useState } from 'react'
import { SETUP_DISMISSED_KEY } from '../constants'
import type { SetupDismissal } from '../types'

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(SETUP_DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

/** A per-browser preference. Hidden until mount reads it, so a dismissed card never flashes. */
export function useSetupDismissal(): SetupDismissal {
  const [isDismissed, setDismissed] = useState(true)

  useEffect(() => setDismissed(readDismissed()), [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    try {
      window.localStorage.setItem(SETUP_DISMISSED_KEY, '1')
    } catch {
      // Private windows can refuse storage; the card stays hidden for this visit.
    }
  }, [])

  return { isDismissed, dismiss }
}
