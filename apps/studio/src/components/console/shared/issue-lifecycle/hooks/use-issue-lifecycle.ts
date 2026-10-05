import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  assignTriage,
  assignTriageMany,
  type IssueLifecycleInput,
  type Member,
  STUDIO_QUERY_KEY,
  setIssueLifecycle,
  type TriageItemRef,
} from '@/integrations/studio-api'
import type { WhiskersIssue } from '@/integrations/whiskers'
import { useConsoleStore } from '../../../use-console-store'
import {
  issueTriageRef,
  patchTriageCache,
  readTriage,
  restoreTriageCache,
} from '../../console-data'
import type { IssueCacheSnapshot, IssueLifecycleApi, LifecycleAction } from '../types'
import {
  applyAction,
  failedIssueIds,
  invalidateIssueQueries,
  lifecycleMessage,
  lifecycleRequests,
  mergeLifecycleRows,
  partialFailureMessage,
  patchIssueCaches,
  plural,
  restoreIssueCaches,
  restoreRequests,
  rollbackIssues,
} from '../utils'
import { ASSIGN_FAILED_NOTE, LIFECYCLE_FAILED_NOTE, LIFECYCLE_UNMIRRORED_NOTE } from '../values'

function flash(message: string, onUndo?: () => void) {
  useConsoleStore.getState().flash(message, onUndo)
}

/** Sends each scope's request; whatever failed goes back as it was at once, the rest stands. */
async function send(
  queryClient: QueryClient,
  requests: IssueLifecycleInput[],
  snapshot: IssueCacheSnapshot,
) {
  const results = await Promise.allSettled(requests.map(setIssueLifecycle))
  const landed = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
  if (landed.length === 0) {
    restoreIssueCaches(queryClient, snapshot)
    flash(LIFECYCLE_FAILED_NOTE)
    return
  }
  mergeLifecycleRows(
    queryClient,
    landed.flatMap((result) => result.issues),
  )
  const failed = failedIssueIds(requests, results)
  if (failed.length > 0) {
    rollbackIssues(queryClient, snapshot, failed)
    flash(partialFailureMessage(failed.length))
  } else if (landed.some((result) => !result.mirrored)) flash(LIFECYCLE_UNMIRRORED_NOTE)
  if (landed.every((result) => result.mirrored)) invalidateIssueQueries(queryClient)
}

function rewrite(queryClient: QueryClient, rows: Map<string, WhiskersIssue>) {
  return patchIssueCaches(queryClient, (issue) => rows.get(issue.id))
}

function applyLifecycle(
  queryClient: QueryClient,
  issues: WhiskersIssue[],
  action: LifecycleAction,
) {
  if (issues.length === 0) return
  const now = new Date()
  const next = new Map(issues.map((issue) => [issue.id, applyAction(issue, action, now)]))
  const previous = new Map(issues.map((issue) => [issue.id, issue]))
  void send(queryClient, lifecycleRequests(issues, action, now), rewrite(queryClient, next))
  flash(lifecycleMessage(action, issues), () => {
    void send(queryClient, restoreRequests(issues), rewrite(queryClient, previous))
  })
}

function assignAll(queryClient: QueryClient, refs: TriageItemRef[], assigneeUserId: string | null) {
  const previous = refs.map((ref) => patchTriageCache(queryClient, ref, { assigneeUserId }))
  const [first] = refs
  const request =
    refs.length === 1 && first
      ? assignTriage(first, assigneeUserId)
      : assignTriageMany(
          { scope: first?.scope ?? '', itemKind: 'issue', itemRefs: refs.map((r) => r.itemRef) },
          assigneeUserId,
        )
  request
    .then(() => queryClient.invalidateQueries({ queryKey: [STUDIO_QUERY_KEY, 'triage-activity'] }))
    .catch(() => {
      refs.forEach((ref, index) => {
        restoreTriageCache(queryClient, ref, previous[index])
      })
      flash(ASSIGN_FAILED_NOTE)
    })
}

/** One scope and one assignee per request; the bulk endpoint takes a single project. */
function assignIssues(
  queryClient: QueryClient,
  refs: TriageItemRef[],
  assignee: (string | null)[],
) {
  const groups = new Map<string, { refs: TriageItemRef[]; assigneeUserId: string | null }>()
  refs.forEach((ref, index) => {
    const assigneeUserId = assignee[index] ?? null
    const key = `${ref.scope}|${assigneeUserId}`
    const group = groups.get(key) ?? { refs: [], assigneeUserId }
    group.refs.push(ref)
    groups.set(key, group)
  })
  for (const group of groups.values()) assignAll(queryClient, group.refs, group.assigneeUserId)
}

function assignLifecycle(queryClient: QueryClient, issues: WhiskersIssue[], member: Member | null) {
  const refs = issues.map(issueTriageRef)
  if (refs.length === 0) return
  const before = refs.map((ref) => readTriage(queryClient, ref)?.assigneeUserId ?? null)
  assignIssues(
    queryClient,
    refs,
    refs.map(() => member?.id ?? null),
  )
  const what = refs.length === 1 ? 'the issue' : plural(refs.length, 'issue')
  flash(member ? `Assigned ${what} to ${member.name}` : `Unassigned ${what}`, () =>
    assignIssues(queryClient, refs, before),
  )
}

/** Optimistic lifecycle and assignee changes, each with an undo in the console toast. */
export function useIssueLifecycle(): IssueLifecycleApi {
  const queryClient = useQueryClient()
  return useMemo(
    () => ({
      apply: (issues, action) => applyLifecycle(queryClient, issues, action),
      assign: (issues, member) => assignLifecycle(queryClient, issues, member),
    }),
    [queryClient],
  )
}
