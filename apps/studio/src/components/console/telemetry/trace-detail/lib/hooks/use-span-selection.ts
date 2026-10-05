import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

/** The URL owns the open span, so a link can land on it. */
export function useSpanSelection(): (spanId: string | undefined) => void {
  const navigate = useNavigate({ from: '/console/traces/$traceId' })
  return useCallback(
    (span) => void navigate({ search: (previous) => ({ ...previous, span }), replace: true }),
    [navigate],
  )
}
