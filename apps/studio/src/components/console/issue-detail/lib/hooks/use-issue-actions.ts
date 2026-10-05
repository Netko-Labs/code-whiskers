import { useCallback, useMemo, useState } from 'react'
import type { Member, ResolveMode } from '@/integrations/studio-api'
import type { WhiskersIssue } from '@/integrations/whiskers'
import { isTyping, useDocumentKeydown } from '@/shared/dom-events'
import { issueTriageRef, triageKey, useTriageRecords } from '../../../shared/console-data'
import { type ArchiveChoice, useIssueLifecycle } from '../../../shared/issue-lifecycle'
import type { IssueActionsState } from '../types'

/**
 * The header's actions and their shortcuts: e resolves (or reopens a resolved issue), shift+e
 * resolves in the next release, a opens the archive menu, i opens the assignee menu.
 */
export function useIssueActions(issue: WhiskersIssue): IssueActionsState {
  const lifecycle = useIssueLifecycle()
  const records = useTriageRecords()
  const [isArchiveOpen, setArchiveOpen] = useState(false)
  const [isAssignOpen, setAssignOpen] = useState(false)
  const ref = issueTriageRef(issue)

  const actions = useMemo(
    () => ({
      resolve: (mode: ResolveMode) => lifecycle.apply([issue], { kind: 'resolve', mode }),
      archive: (choice: ArchiveChoice) => lifecycle.apply([issue], { kind: 'archive', choice }),
      unresolve: () => lifecycle.apply([issue], { kind: 'unresolve' }),
      assign: (member: Member | null) => lifecycle.assign([issue], member),
    }),
    [issue, lifecycle],
  )

  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      const key = event.key.toLowerCase()
      if (key === 'e' && event.shiftKey) actions.resolve('next_release')
      else if (key === 'e') {
        if (issue.status === 'resolved') actions.unresolve()
        else actions.resolve('now')
      } else if (key === 'a') setArchiveOpen(true)
      else if (key === 'i') setAssignOpen(true)
      else return
      event.preventDefault()
    },
    [actions, issue.status],
  )
  useDocumentKeydown(onKey)

  return {
    ...actions,
    isSample: ref === null,
    assigneeUserId: ref ? (records.get(triageKey(ref))?.assigneeUserId ?? null) : null,
    isArchiveOpen,
    setArchiveOpen,
    isAssignOpen,
    setAssignOpen,
  }
}
