import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useReducer } from 'react'
import { whiskersLatestIssueQuery } from '@/integrations/whiskers'
import { LISTEN_FALLBACK_MS } from '../constants'
import type { FirstEventListener } from '../types'
import { LISTENING, listenerReducer, testIssueOf } from '../utils'

/**
 * The realtime `issues` topic invalidates the latest-issue query when an event lands; the
 * interval only covers a socket that is down, and stops once something arrived.
 */
export function useFirstEvent(projectId: string): FirstEventListener {
  const [state, dispatch] = useReducer(listenerReducer, LISTENING)
  const latest = useQuery({
    ...whiskersLatestIssueQuery(projectId),
    retry: false,
    refetchInterval: state.status === 'received' ? false : LISTEN_FALLBACK_MS,
  })

  useEffect(() => {
    if (latest.isError) dispatch({ type: 'failed' })
    else if (latest.isSuccess) {
      const issue = latest.data ? { id: latest.data.id, title: latest.data.title } : null
      dispatch({ type: 'polled', issue })
    }
  }, [latest.isError, latest.isSuccess, latest.data])

  const onTestSent = useCallback(
    (result: { issueId: string }) =>
      dispatch({ type: 'test-sent', issue: testIssueOf(result.issueId) }),
    [],
  )
  return { state, onTestSent }
}
