import { useEffect, useMemo, useReducer } from 'react'
import type { WhiskersIssue } from '@/integrations/whiskers'
import type { IssueSelection } from '../types'
import { EMPTY_SELECTION, selectionReducer } from '../utils'

/** Rows that leave the view (resolved, filtered out) leave the selection with them. */
export function useIssueSelection(rows: WhiskersIssue[]): IssueSelection {
  const [state, dispatch] = useReducer(selectionReducer, EMPTY_SELECTION)
  const order = useMemo(() => rows.map((row) => row.id), [rows])

  useEffect(() => {
    dispatch({ kind: 'keep', ids: order })
  }, [order])

  return useMemo(
    () => ({
      ids: new Set(state.ids),
      toggle: (id, isRange) => dispatch({ kind: 'toggle', id, isRange, order }),
      toggleAll: () => dispatch({ kind: 'all', ids: order }),
      clear: () => dispatch({ kind: 'clear' }),
    }),
    [state.ids, order],
  )
}
