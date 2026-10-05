import type { ArchiveSpec, IssueLifecycleInput } from '@/integrations/studio-api'
import type { WhiskersIssue } from '@/integrations/whiskers'
import type { ArchiveChoice, LifecycleAction, LifecycleBody } from '../types'

export function issueScope(issue: Pick<WhiskersIssue, 'projectId'>): string {
  return `project:${issue.projectId}`
}

export function archiveSpecFor(choice: ArchiveChoice, now: Date): ArchiveSpec {
  if (choice.kind === 'for') {
    return { mode: 'until', until: new Date(now.getTime() + choice.ms).toISOString() }
  }
  if (choice.kind === 'events') return { mode: 'events', count: choice.count }
  if (choice.kind === 'users') return { mode: 'users', count: choice.count }
  return { mode: 'forever' }
}

function bodyFor(action: LifecycleAction, now: Date): LifecycleBody {
  if (action.kind === 'resolve') return { status: 'resolved', resolve: { mode: action.mode } }
  if (action.kind === 'archive') {
    return { status: 'archived', archive: archiveSpecFor(action.choice, now) }
  }
  return { status: 'unresolved' }
}

/** Counters restart from the current totals, so only what was left of the target carries over. */
function restoreArchiveSpec(issue: WhiskersIssue): ArchiveSpec {
  if (issue.archivedUntil) return { mode: 'until', until: issue.archivedUntil.toISOString() }
  if (issue.archiveUntilEvents !== null) {
    return { mode: 'events', count: Math.max(1, issue.archiveUntilEvents - issue.eventCount) }
  }
  if (issue.archiveUntilUsers !== null) {
    return { mode: 'users', count: Math.max(1, issue.archiveUntilUsers - issue.userCount) }
  }
  return { mode: 'forever' }
}

function restoreBodyFor(issue: WhiskersIssue): LifecycleBody {
  if (issue.status === 'unresolved') return { status: 'unresolved' }
  if (issue.status === 'resolved') {
    return {
      status: 'resolved',
      resolve: { mode: issue.resolvedInRelease ? 'next_release' : 'now' },
    }
  }
  return { status: 'archived', archive: restoreArchiveSpec(issue) }
}

/** One request per scope and body: the bulk endpoint authorizes a single project at a time. */
function grouped(entries: { issue: WhiskersIssue; body: LifecycleBody }[]): IssueLifecycleInput[] {
  const groups = new Map<string, IssueLifecycleInput>()
  for (const { issue, body } of entries) {
    const scope = issueScope(issue)
    const key = JSON.stringify({ scope, ...body })
    const group = groups.get(key)
    if (group) group.issueIds.push(issue.id)
    else groups.set(key, { scope, issueIds: [issue.id], ...body })
  }
  return [...groups.values()]
}

export function lifecycleRequests(
  issues: WhiskersIssue[],
  action: LifecycleAction,
  now: Date,
): IssueLifecycleInput[] {
  const body = bodyFor(action, now)
  return grouped(issues.map((issue) => ({ issue, body })))
}

/** The undo of any lifecycle change: each issue goes back exactly as it was. */
export function restoreRequests(issues: WhiskersIssue[]): IssueLifecycleInput[] {
  return grouped(issues.map((issue) => ({ issue, body: restoreBodyFor(issue) })))
}

const CLEARED = {
  resolvedInRelease: null,
  archivedUntil: null,
  archiveUntilEvents: null,
  archiveUntilUsers: null,
} as const

/** The optimistic row: what whiskers will mirror, guessed from what the client already knows. */
export function applyAction(
  issue: WhiskersIssue,
  action: LifecycleAction,
  now: Date,
): WhiskersIssue {
  if (action.kind === 'unresolve') {
    return { ...issue, ...CLEARED, resolvedAt: null, status: 'unresolved' }
  }
  const badges = issue.badges.filter((badge) => badge !== 'regressed')
  if (action.kind === 'resolve') {
    return {
      ...issue,
      ...CLEARED,
      badges,
      status: 'resolved',
      resolvedAt: now,
      resolvedInRelease: action.mode === 'next_release' ? issue.lastRelease : null,
    }
  }
  const { choice } = action
  return {
    ...issue,
    ...CLEARED,
    badges,
    status: 'archived',
    resolvedAt: null,
    archivedUntil: choice.kind === 'for' ? new Date(now.getTime() + choice.ms) : null,
    archiveUntilEvents: choice.kind === 'events' ? issue.eventCount + choice.count : null,
    archiveUntilUsers: choice.kind === 'users' ? issue.userCount + choice.count : null,
  }
}

/** Every issue whose scope's request failed. */
export function failedIssueIds(
  requests: IssueLifecycleInput[],
  results: PromiseSettledResult<unknown>[],
): string[] {
  return requests.flatMap((request, index) =>
    results[index]?.status === 'rejected' ? request.issueIds : [],
  )
}
