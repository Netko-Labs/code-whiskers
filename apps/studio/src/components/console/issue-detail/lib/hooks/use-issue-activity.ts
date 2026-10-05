import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { postTriageComment, triageActivityQuery } from '@/integrations/studio-api'
import type { WhiskersIssue } from '@/integrations/whiskers'
import { issueTriageRef } from '../../../shared/console-data'
import { useConsoleStore } from '../../../use-console-store'
import type { IssueActivityState } from '../types'

/** The issue's timeline, and the draft at its foot; drafts survive switching issues. */
export function useIssueActivity(issue: WhiskersIssue): IssueActivityState {
  const queryClient = useQueryClient()
  const ref = issueTriageRef(issue)
  const draft = useConsoleStore((s) => s.drafts[issue.id] ?? '')
  const { data } = useQuery({ ...triageActivityQuery(ref), retry: false })

  const post = useCallback(() => {
    const { flash, setDraft } = useConsoleStore.getState()
    const body = useConsoleStore.getState().drafts[issue.id]?.trim()
    if (!body) {
      flash('Nothing to post yet')
      return
    }
    setDraft(issue.id, '')
    postTriageComment(ref, body)
      .then(() => queryClient.invalidateQueries({ queryKey: triageActivityQuery(ref).queryKey }))
      .catch(() => {
        setDraft(issue.id, body)
        flash('Comment not posted — your draft is back')
      })
  }, [issue.id, ref, queryClient])

  return {
    ref,
    entries: data ?? [],
    draft,
    setDraft: (next) => useConsoleStore.getState().setDraft(issue.id, next),
    post,
  }
}
