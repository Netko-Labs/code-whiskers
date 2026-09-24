import { eventTable, issueTable, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, count, desc, eq, gt, type SQL } from 'drizzle-orm'
import { ALERT_EXAMPLES } from './constants'
import type { AlertRule, AlertVerdict } from './types'

const QUIET: AlertVerdict = { isFiring: false, title: '', text: '', path: '' }

function onProject(
  column: typeof issueTable.projectId | typeof eventTable.projectId,
  projectId: string | null,
): SQL[] {
  return projectId ? [eq(column, projectId)] : []
}

function listed(lines: string[]): string {
  const shown = lines.slice(0, ALERT_EXAMPLES).map((line) => `• ${line}`)
  const more = lines.length - shown.length
  return more > 0 ? `${shown.join('\n')}\n• and ${more} more` : shown.join('\n')
}

/**
 * Event-shaped rules look back to the last firing, so one new issue alerts once. Rate rules
 * look at a sliding window and hold off re-firing inside it.
 */
export async function evaluateRule(rule: AlertRule, now = new Date()): Promise<AlertVerdict> {
  const window = new Date(now.getTime() - rule.windowMinutes * 60_000)
  const lastFired = rule.lastFiredAt ? new Date(rule.lastFiredAt) : null
  const since = lastFired && lastFired > window ? lastFired : window
  const where = rule.projectId ? ` in project ${rule.projectId}` : ''

  if (rule.kind === 'new_issue') {
    const issues = await db
      .select({ title: issueTable.title })
      .from(issueTable)
      .where(
        and(gt(issueTable.firstSeen, since), ...onProject(issueTable.projectId, rule.projectId)),
      )
      .orderBy(desc(issueTable.firstSeen))
    if (issues.length < rule.threshold) return QUIET
    return {
      isFiring: true,
      title: `${issues.length} new issue${issues.length === 1 ? '' : 's'}${where}`,
      text: listed(issues.map((i) => i.title)),
      path: '/console/issues',
    }
  }

  if (rule.kind === 'error_rate') {
    const [row] = await db
      .select({ value: count() })
      .from(eventTable)
      .where(
        and(gt(eventTable.receivedAt, window), ...onProject(eventTable.projectId, rule.projectId)),
      )
    const events = row?.value ?? 0
    if (events < rule.threshold) return QUIET
    return {
      isFiring: true,
      title: `${events} errors in ${rule.windowMinutes}m${where}`,
      text: `Over the threshold of ${rule.threshold} for "${rule.name}".`,
      path: '/console/issues',
    }
  }

  const verdict = rule.kind === 'review_failed' ? 'failed' : 'request_changes'
  const reviews = await db
    .select({ owner: reviewTable.owner, repo: reviewTable.repo, prNumber: reviewTable.prNumber })
    .from(reviewTable)
    .where(
      and(
        gt(reviewTable.completedAt, since),
        verdict === 'failed'
          ? eq(reviewTable.status, 'failed')
          : eq(reviewTable.verdict, 'request_changes'),
      ),
    )
  if (reviews.length < rule.threshold) return QUIET
  const noun = verdict === 'failed' ? 'review failed' : 'pull request blocked'
  return {
    isFiring: true,
    title: `${reviews.length} ${noun}${reviews.length === 1 ? '' : 's'}`,
    text: listed(reviews.map((r) => `${r.owner}/${r.repo}#${r.prNumber}`)),
    path: '/console/pull-requests',
  }
}

/** A rate rule that fired inside its own window does not fire again until the window passes. */
export function isCoolingDown(rule: AlertRule, now = new Date()): boolean {
  if (rule.kind !== 'error_rate' || !rule.lastFiredAt) return false
  return now.getTime() - new Date(rule.lastFiredAt).getTime() < rule.windowMinutes * 60_000
}
