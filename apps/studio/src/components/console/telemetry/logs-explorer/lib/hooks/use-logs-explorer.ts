import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useConsoleScope } from '../../../../shared/console-scope'
import { isPinned, windowSpecOf } from '../../../shared/telemetry-time'
import type { LogSearch, LogsExplorerState } from '../types'
import { cleanLogSearch, isLogSearchFiltered, toLogFilter } from '../utils'
import { LOG_RANGE_FALLBACK } from '../values'

const WINDOW_KEYS = ['range', 'from', 'to', 'live'] as const

/**
 * The URL owns the search. A paused view anchors its window at the moment it was asked for, so
 * realtime refetches return the same lines; live tail lets the window slide to now.
 */
export function useLogsExplorer(search: LogSearch): LogsExplorerState {
  const navigate = useNavigate({ from: '/console/live-logs' })
  const scope = useConsoleScope()
  const [anchor, setAnchor] = useState(() => Date.now())
  const isLive = !!search.live && !isPinned(search)

  return useMemo(() => {
    const update = (patch: Partial<LogSearch>) => {
      if (WINDOW_KEYS.some((key) => key in patch)) setAnchor(Date.now())
      void navigate({
        search: (previous) => cleanLogSearch({ ...previous, ...patch }),
        replace: true,
      })
    }
    return {
      search,
      filter: toLogFilter(search, scope.projectIds),
      window: windowSpecOf(search, LOG_RANGE_FALLBACK, isLive ? undefined : anchor),
      isLive,
      isFiltered: isLogSearchFiltered(search),
      update,
      refresh: () => setAnchor(Date.now()),
    }
  }, [search, scope.projectIds, anchor, isLive, navigate])
}
