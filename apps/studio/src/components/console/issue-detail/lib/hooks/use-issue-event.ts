import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type WhiskersIssue, whiskersIssueEventQuery } from '@/integrations/whiskers'
import type { IssueEventState } from '../types'

/** `eventId` is a row id or `latest` / `oldest`; the navigator walks prev / next from there. */
export function useIssueEvent(issue: WhiskersIssue, eventId: string): IssueEventState {
  const { data, isLoading, isError } = useQuery({
    ...whiskersIssueEventQuery(issue.id, eventId),
    retry: false,
  })

  return useMemo(() => ({ event: data, isLoading, isMissing: isError }), [data, isLoading, isError])
}
