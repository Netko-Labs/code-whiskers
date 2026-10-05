import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type IssuePeriod, type WhiskersIssue, whiskersIssueQuery } from '@/integrations/whiskers'
import type { IssueDetailState } from '../types'

/** Reads whiskers, painting the list's row (the seed) until the detail arrives. */
export function useIssueDetail(
  issueId: string,
  seed: WhiskersIssue | undefined,
  period: IssuePeriod,
): IssueDetailState {
  const { data, isError } = useQuery({ ...whiskersIssueQuery(issueId, period), retry: false })

  return useMemo(
    () => ({ issue: data?.issue ?? seed, detail: data, isMissing: isError && !seed }),
    [seed, data, isError],
  )
}
