import type { QueryClient } from '@tanstack/react-query'
import { type TriageItemRef, type TriageRecord, triageQuery } from '@/integrations/studio-api'
import type { WhiskersIssue } from '@/integrations/whiskers'
import type { ConsoleItem, TriageBucket, TriageStatus } from '../../console-model'

export function triageKey(ref: TriageItemRef): string {
  return `${ref.scope.toLowerCase()}|${ref.itemKind}|${ref.itemRef}`
}

/** The dismissal key the reviewer matches on: file and title survive a re-review, ids do not. */
export function findingRef(scope: string, finding: { file: string; title: string }): TriageItemRef {
  return { scope, itemKind: 'finding', itemRef: `${finding.file}:${finding.title}` }
}

/** An issue is triaged under its project. */
export function issueTriageRef(issue: Pick<WhiskersIssue, 'id' | 'projectId'>): TriageItemRef {
  return { scope: `project:${issue.projectId}`, itemKind: 'issue', itemRef: issue.id }
}

const UNDECIDED: TriageStatus = {
  resolved: false,
  archived: false,
  regressed: false,
  approved: false,
  tracked: false,
  snoozedUntil: null,
  assigneeUserId: null,
  decidedAt: null,
  done: false,
}

/** Issue state is whiskers' mirror; studio's record still owns the assignee and the rest. */
export function statusFor(
  item: ConsoleItem,
  records: Map<string, TriageRecord>,
  now = new Date(),
): TriageStatus {
  const record = item.triage ? records.get(triageKey(item.triage)) : undefined
  const resolved = item.issue?.status === 'resolved'
  const archived = item.issue?.status === 'archived'
  const regressed = !!item.issue?.badges.includes('regressed')
  if (!record) return { ...UNDECIDED, resolved, archived, regressed, done: resolved || archived }
  const approved = record.status === 'approved'
  const tracked = record.status === 'tracked'
  const isSnoozing =
    record.status === 'snoozed' && record.snoozedUntil !== null && record.snoozedUntil > now
  return {
    resolved,
    archived,
    regressed,
    approved,
    tracked,
    snoozedUntil: isSnoozing ? record.snoozedUntil : null,
    assigneeUserId: record.assigneeUserId,
    decidedAt: record.updatedAt,
    done: resolved || archived || approved || tracked,
  }
}

/** Inbox drops running snoozes and issues that are no longer unresolved; Snoozed is the rest. */
export function inBucket(
  status: TriageStatus,
  bucket: TriageBucket,
  viewerId: string | undefined,
): boolean {
  if (status.resolved || status.archived) return false
  if (bucket === 'assigned') return !!viewerId && status.assigneeUserId === viewerId
  if (bucket === 'snoozed') return status.snoozedUntil !== null
  return status.snoozedUntil === null
}

export function readTriage(queryClient: QueryClient, ref: TriageItemRef): TriageRecord | undefined {
  const key = triageKey(ref)
  return queryClient.getQueryData(triageQuery().queryKey)?.find((r) => triageKey(r) === key)
}

/** Optimistic write into the cached decisions; returns what was there so a failure can undo it. */
export function patchTriageCache(
  queryClient: QueryClient,
  ref: TriageItemRef,
  patch: Partial<Pick<TriageRecord, 'status' | 'assigneeUserId' | 'snoozedUntil' | 'note'>>,
): TriageRecord | undefined {
  const key = triageKey(ref)
  const previous = readTriage(queryClient, ref)
  const base: TriageRecord = previous ?? {
    ...ref,
    status: 'open',
    assigneeUserId: null,
    snoozedUntil: null,
    note: null,
    updatedAt: new Date(),
  }
  const next: TriageRecord = { ...base, ...patch, updatedAt: new Date() }
  queryClient.setQueryData(triageQuery().queryKey, (records = []) => [
    ...records.filter((r) => triageKey(r) !== key),
    next,
  ])
  return previous
}

export function restoreTriageCache(
  queryClient: QueryClient,
  ref: TriageItemRef,
  previous: TriageRecord | undefined,
): void {
  const key = triageKey(ref)
  queryClient.setQueryData(triageQuery().queryKey, (records = []) => [
    ...records.filter((r) => triageKey(r) !== key),
    ...(previous ? [previous] : []),
  ])
}
