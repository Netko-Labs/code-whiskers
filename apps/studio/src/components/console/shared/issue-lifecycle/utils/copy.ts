import type { WhiskersIssue } from '@/integrations/whiskers'
import { BADGE_ORDER, DAY_MS, SHA_LENGTH, SHORT_SHA_LENGTH, TOAST_TITLE_LENGTH } from '../constants'
import type { IssueBadgeView, IssueBanner, LifecycleAction } from '../types'
import { ARCHIVE_GROUPS, BADGE_VIEWS, STATUS_BADGES } from '../values'

export function plural(count: number, noun: string): string {
  return `${count.toLocaleString('en-US')} ${noun}${count === 1 ? '' : 's'}`
}

/** Releases named by commit read like git does: seven characters. */
export function shortRelease(release: string): string {
  const isSha = release.length >= SHA_LENGTH && /^[0-9a-f]+$/i.test(release)
  return isSha ? release.slice(0, SHORT_SHA_LENGTH) : release
}

const CLOCK = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const WEEKDAY_CLOCK = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const CALENDAR_DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

/** Today reads as a clock, this week as a weekday, anything later as a date. */
export function formatUntil(until: Date, now: Date): string {
  if (until.toDateString() === now.toDateString()) return CLOCK.format(until)
  if (until.getTime() - now.getTime() < 6 * DAY_MS) return WEEKDAY_CLOCK.format(until)
  return CALENDAR_DAY.format(until)
}

function archivedBanner(issue: WhiskersIssue, now: Date): IssueBanner {
  if (issue.archivedUntil) {
    return {
      message: `Archived until ${formatUntil(issue.archivedUntil, now)}`,
      meta: 'back in the inbox on the first event after that',
      tone: 'info',
    }
  }
  if (issue.archiveUntilEvents !== null) {
    const left = Math.max(0, issue.archiveUntilEvents - issue.eventCount)
    return {
      message: `Archived until ${plural(left, 'more event')}`,
      meta: `back in the inbox at ${plural(issue.archiveUntilEvents, 'event')}`,
      tone: 'info',
    }
  }
  if (issue.archiveUntilUsers !== null) {
    const left = Math.max(0, issue.archiveUntilUsers - issue.userCount)
    return {
      message: `Archived until ${plural(left, 'more user')}`,
      meta: `back in the inbox at ${plural(issue.archiveUntilUsers, 'user')}`,
      tone: 'info',
    }
  }
  return {
    message: 'Archived forever',
    meta: 'stays out of the inbox until unarchived',
    tone: 'info',
  }
}

/** The one line under the title that says where the issue stands; null when it simply is open. */
export function statusBanner(issue: WhiskersIssue, now: Date): IssueBanner | null {
  if (issue.status === 'archived') return archivedBanner(issue, now)
  if (issue.status === 'resolved') {
    return issue.resolvedInRelease
      ? {
          message: `Resolved in next release (after ${shortRelease(issue.resolvedInRelease)})`,
          meta: 'a later release that sees it reopens it',
          tone: 'ok',
        }
      : { message: 'Resolved', meta: 'the next event reopens it', tone: 'ok' }
  }
  if (issue.badges.includes('regressed')) {
    return {
      message: 'Regressed — seen again after it was resolved',
      meta: issue.lastRelease ? `in ${shortRelease(issue.lastRelease)}` : '',
      tone: 'warn',
    }
  }
  return null
}

/** Server badges in urgency order; the status joins them only where the list mixes statuses. */
export function issueBadges(issue: WhiskersIssue, hasStatus: boolean): IssueBadgeView[] {
  const status = issue.status === 'unresolved' || !hasStatus ? [] : [STATUS_BADGES[issue.status]]
  const badges = BADGE_ORDER.filter((badge) => issue.badges.includes(badge)).map(
    (badge) => BADGE_VIEWS[badge],
  )
  return [...status, ...badges]
}

function archiveLabel(action: Extract<LifecycleAction, { kind: 'archive' }>): string {
  const { choice } = action
  if (choice.kind === 'forever') return 'forever'
  if (choice.kind === 'events') return `until ${plural(choice.count, 'more event')}`
  if (choice.kind === 'users') return `until ${plural(choice.count, 'more user')}`
  const option = ARCHIVE_GROUPS.flatMap((group) => group.options).find(
    (candidate) => candidate.choice.kind === 'for' && candidate.choice.ms === choice.ms,
  )
  return `for ${option?.label ?? 'a while'}`
}

function clip(title: string): string {
  return title.length > TOAST_TITLE_LENGTH ? `${title.slice(0, TOAST_TITLE_LENGTH - 1)}…` : title
}

/** The toast after a change: what happened, to what. */
export function lifecycleMessage(action: LifecycleAction, issues: WhiskersIssue[]): string {
  const [only] = issues
  const what = issues.length === 1 && only ? clip(only.title) : plural(issues.length, 'issue')
  if (action.kind === 'unresolve') return `Reopened ${what}`
  if (action.kind === 'resolve') {
    return action.mode === 'next_release'
      ? `Resolved ${what} in the next release`
      : `Resolved ${what}`
  }
  return `Archived ${what} ${archiveLabel(action)}`
}
