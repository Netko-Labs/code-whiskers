import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type WhiskersIssue, whiskersIssueEventsQuery } from '@/integrations/whiskers'
import { isSampleIssue, sampleIssueEvents } from '../../../shared/console-data'
import type { IssueEventsState } from '../types'

/** The newest page of events, read only once the picker opens. */
export function useIssueEvents(issue: WhiskersIssue, isOpen: boolean): IssueEventsState {
  const isSample = isSampleIssue(issue)
  const { data, isLoading } = useQuery({
    ...whiskersIssueEventsQuery(issue.id),
    enabled: isOpen && !isSample,
    retry: false,
  })

  return useMemo(
    () =>
      isSample ? { list: sampleIssueEvents(issue), isLoading: false } : { list: data, isLoading },
    [isSample, issue, data, isLoading],
  )
}
