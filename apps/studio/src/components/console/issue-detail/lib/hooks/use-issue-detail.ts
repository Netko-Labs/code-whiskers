import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type IssuePeriod, type WhiskersIssue, whiskersIssueQuery } from '@/integrations/whiskers'
import { isSampleIssue, sampleIssue, sampleIssueDetail } from '../../../shared/console-data'
import type { IssueDetailState } from '../types'

/** Sample issues answer from the fixture; live ones read whiskers, painting the seed meanwhile. */
export function useIssueDetail(
  issueId: string,
  seed: WhiskersIssue | undefined,
  period: IssuePeriod,
): IssueDetailState {
  const isSample = isSampleIssue({ id: issueId })
  const { data, isError } = useQuery({
    ...whiskersIssueQuery(issueId, period),
    enabled: !isSample,
    retry: false,
  })

  return useMemo(() => {
    if (isSample) {
      const issue = seed ?? sampleIssue(issueId)
      return {
        issue,
        detail: issue ? sampleIssueDetail(issue, period) : undefined,
        isMissing: !issue,
      }
    }
    return { issue: data?.issue ?? seed, detail: data, isMissing: isError && !seed }
  }, [isSample, issueId, seed, period, data, isError])
}
