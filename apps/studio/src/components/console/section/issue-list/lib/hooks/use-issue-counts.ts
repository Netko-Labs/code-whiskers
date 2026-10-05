import { useQueries } from '@tanstack/react-query'
import { type IssueListParams, whiskersIssueTotalQuery } from '@/integrations/whiskers'
import { sampleIssues } from '../../../../shared/console-data'
import type { IssueCounts } from '../types'
import { sampleRows, visibleIssues } from '../utils'
import { ISSUE_TABS } from '../values'

/** One `total` per tab under the same filters, so each tab says what it holds before it opens. */
export function useIssueCounts(params: IssueListParams, isSample: boolean): IssueCounts {
  const totals = useQueries({
    queries: ISSUE_TABS.map((tab) => ({
      ...whiskersIssueTotalQuery({ ...params, status: tab.status }),
      enabled: !isSample,
      retry: false,
    })),
  })

  if (isSample) {
    const rows = sampleRows(sampleIssues(), params)
    return Object.fromEntries(
      ISSUE_TABS.map((tab) => [tab.status, visibleIssues(rows, tab.status, 'issues').length]),
    )
  }
  return Object.fromEntries(ISSUE_TABS.map((tab, index) => [tab.status, totals[index]?.data]))
}
