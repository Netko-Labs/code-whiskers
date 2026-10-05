import type { IssueTransition } from '@code-whiskers/whiskers-domain'
import type { IngestedEventContext, IssueLifecycleFields } from './types'

/** Only a resolve-in-next-release met by a different release needs that release's age. */
export function needsReleaseAge(issue: IssueLifecycleFields, release: string | null): boolean {
  return (
    issue.status === 'resolved' &&
    issue.resolvedInRelease !== null &&
    release !== null &&
    release !== issue.resolvedInRelease
  )
}

function isRegression(issue: IssueLifecycleFields, event: IngestedEventContext): boolean {
  if (issue.resolvedInRelease === null) return true
  if (!needsReleaseAge(issue, event.release)) return false
  // An older release still in the wild is not the fix failing.
  return (
    event.releaseFirstSeenAt !== null &&
    issue.resolvedAt !== null &&
    event.releaseFirstSeenAt > issue.resolvedAt
  )
}

function isArchiveOver(issue: IssueLifecycleFields, now: Date): boolean {
  if (issue.archivedUntil && now >= issue.archivedUntil) return true
  if (issue.archiveUntilEvents !== null && issue.eventCount >= issue.archiveUntilEvents) return true
  return issue.archiveUntilUsers !== null && issue.userCount >= issue.archiveUntilUsers
}

/** What one more event does to an issue's lifecycle; counts already include the event. */
export function ingestTransitionOf(
  issue: IssueLifecycleFields,
  event: IngestedEventContext,
): IssueTransition | null {
  if (issue.status === 'resolved') return isRegression(issue, event) ? 'regressed' : null
  if (issue.status === 'archived') return isArchiveOver(issue, event.now) ? 'unarchived' : null
  return null
}
