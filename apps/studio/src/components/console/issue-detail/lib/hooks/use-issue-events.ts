import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type WhiskersIssue, whiskersIssueEventsQuery } from '@/integrations/whiskers'
import type { IssueEventsState } from '../types'

/** The newest page of events, read only once the picker opens. */
export function useIssueEvents(issue: WhiskersIssue, isOpen: boolean): IssueEventsState {
  const { data, isLoading } = useQuery({
    ...whiskersIssueEventsQuery(issue.id),
    enabled: isOpen,
    retry: false,
  })

  return useMemo(() => ({ list: data, isLoading }), [data, isLoading])
}
