import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { TraceUpdate } from '../types'
import { cleanTraceSearch } from '../utils'

export function useTraceUpdate(): TraceUpdate {
  const navigate = useNavigate({ from: '/console/traces/' })
  return useCallback(
    (patch) =>
      void navigate({
        search: (previous) => cleanTraceSearch({ ...previous, ...patch }),
        replace: true,
      }),
    [navigate],
  )
}
