import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type WhiskersIssue, whiskersIssueEventQuery } from '@/integrations/whiskers'
import { isSampleIssue, sampleIssueEvent } from '../../../shared/console-data'
import type { IssueEventState } from '../types'

/** `eventId` is a row id or `latest` / `oldest`; the navigator walks prev / next from there. */
export function useIssueEvent(issue: WhiskersIssue, eventId: string): IssueEventState {
  const isSample = isSampleIssue(issue)
  const { data, isLoading, isError } = useQuery({
    ...whiskersIssueEventQuery(issue.id, eventId),
    enabled: !isSample,
    retry: false,
  })

  return useMemo(
    () =>
      isSample
        ? { event: sampleIssueEvent(issue), isLoading: false, isMissing: false }
        : { event: data, isLoading, isMissing: isError },
    [isSample, issue, data, isLoading, isError],
  )
}
