import { useQueries } from '@tanstack/react-query'
import { type IssueListParams, whiskersIssueTotalQuery } from '@/integrations/whiskers'
import type { IssueCounts } from '../types'
import { ISSUE_TABS } from '../values'

/** One `total` per tab under the same filters, so each tab says what it holds before it opens. */
export function useIssueCounts(params: IssueListParams): IssueCounts {
  const totals = useQueries({
    queries: ISSUE_TABS.map((tab) => ({
      ...whiskersIssueTotalQuery({ ...params, status: tab.status }),
      retry: false,
    })),
  })
  return Object.fromEntries(ISSUE_TABS.map((tab, index) => [tab.status, totals[index]?.data]))
}
