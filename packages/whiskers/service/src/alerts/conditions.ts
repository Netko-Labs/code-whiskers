import { eventTable, issueTable, projectTable, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, asc, count, desc, eq, gt, gte, inArray, lte } from 'drizzle-orm'
import { ALERT_MAX_FIRINGS } from './constants'
import { eventFilters, issueFilters, reviewFilters } from './scope'
import type { AlertCondition, AlertEvaluation, AlertFiring, AlertRule } from './types'
import { cursorFor, plural } from './utils'

const issuePath = (id: string) => `/console/issues/${id}`

/** New issues since the cursor, oldest first; a capped pass moves the cursor only that far. */
async function newIssues(condition: AlertCondition, since: Date, now: Date) {
  const rows = await db
    .select({
      id: issueTable.id,
      title: issueTable.title,
      culprit: issueTable.culprit,
      projectId: issueTable.projectId,
      project: projectTable.name,
      firstSeen: issueTable.firstSeen,
    })
    .from(issueTable)
    .innerJoin(projectTable, eq(projectTable.id, issueTable.projectId))
    .where(
      and(
        gt(issueTable.firstSeen, since),
        lte(issueTable.firstSeen, now),
        ...issueFilters(condition),
      ),
    )
    .orderBy(asc(issueTable.firstSeen))
    .limit(ALERT_MAX_FIRINGS + 1)
  const shown = rows.slice(0, ALERT_MAX_FIRINGS)
  const firings: AlertFiring[] = shown.map((issue) => ({
    title: `New issue in ${issue.project}`,
    text: issue.culprit ? `${issue.title}\n${issue.culprit}` : issue.title,
    path: issuePath(issue.id),
    trigger: 'new_issue',
    subject: { kind: 'issue', ref: issue.id },
    projectId: issue.projectId,
  }))
  const cursor = rows.length > ALERT_MAX_FIRINGS ? (shown.at(-1)?.firstSeen ?? now) : now
  return { firings, cursor }
}

/** Issues with at least `threshold` matching events inside the window. */
async function frequentIssues(condition: AlertCondition, now: Date): Promise<AlertFiring[]> {
  const window = new Date(now.getTime() - condition.windowMinutes * 60_000)
  const events = count()
  const rows = await db
    .select({ issueId: eventTable.issueId, events })
    .from(eventTable)
    .where(and(gt(eventTable.receivedAt, window), ...eventFilters(condition)))
    .groupBy(eventTable.issueId)
    .having(gte(events, condition.threshold))
    .orderBy(desc(events))
    .limit(ALERT_MAX_FIRINGS)
  if (rows.length === 0) return []
  const issues = await db
    .select({
      id: issueTable.id,
      title: issueTable.title,
      projectId: issueTable.projectId,
      project: projectTable.name,
    })
    .from(issueTable)
    .innerJoin(projectTable, eq(projectTable.id, issueTable.projectId))
    .where(
      inArray(
        issueTable.id,
        rows.map((row) => row.issueId),
      ),
    )
  const byId = new Map(issues.map((issue) => [issue.id, issue]))
  return rows.flatMap((row) => {
    const issue = byId.get(row.issueId)
    if (!issue) return []
    return {
      title: `Issue spiking in ${issue.project}`,
      text: `${plural(row.events, 'event')} in ${condition.windowMinutes} min (threshold ${condition.threshold})\n${issue.title}`,
      path: issuePath(issue.id),
      trigger: 'issue_frequency' as const,
      subject: { kind: 'issue' as const, ref: issue.id },
      projectId: issue.projectId,
    }
  })
}

/** Projects with at least `threshold` matching events inside the window. */
async function busyProjects(condition: AlertCondition, now: Date): Promise<AlertFiring[]> {
  const window = new Date(now.getTime() - condition.windowMinutes * 60_000)
  const events = count()
  const rows = await db
    .select({ projectId: eventTable.projectId, project: projectTable.name, events })
    .from(eventTable)
    .innerJoin(projectTable, eq(projectTable.id, eventTable.projectId))
    .where(and(gt(eventTable.receivedAt, window), ...eventFilters(condition)))
    .groupBy(eventTable.projectId, projectTable.name)
    .having(gte(events, condition.threshold))
    .limit(ALERT_MAX_FIRINGS)
  return rows.map((row) => ({
    title: `${plural(row.events, 'error')} in ${condition.windowMinutes} min in ${row.project}`,
    text: `Over the threshold of ${condition.threshold}.`,
    path: `/console/issues?scope=${encodeURIComponent(`project:${row.projectId}`)}`,
    trigger: 'error_rate' as const,
    subject: { kind: 'project' as const, ref: row.projectId },
    projectId: row.projectId,
  }))
}

async function finishedReviews(
  condition: AlertCondition,
  trigger: 'review_failed' | 'blocking_review',
  since: Date,
  now: Date,
): Promise<AlertFiring[]> {
  const rows = await db
    .select({
      id: reviewTable.id,
      owner: reviewTable.owner,
      repo: reviewTable.repo,
      prNumber: reviewTable.prNumber,
      title: reviewTable.title,
    })
    .from(reviewTable)
    .where(
      and(
        gt(reviewTable.completedAt, since),
        lte(reviewTable.completedAt, now),
        trigger === 'review_failed'
          ? eq(reviewTable.status, 'failed')
          : eq(reviewTable.verdict, 'request_changes'),
        ...reviewFilters(condition),
      ),
    )
    .orderBy(asc(reviewTable.completedAt))
    .limit(ALERT_MAX_FIRINGS)
  const verb = trigger === 'review_failed' ? 'Review failed' : 'Review blocked'
  return rows.map((review) => {
    const slug = `${review.owner}/${review.repo}#${review.prNumber}`
    return {
      title: `${verb}: ${slug}`,
      text: review.title ?? slug,
      path: `https://github.com/${review.owner}/${review.repo}/pull/${review.prNumber}`,
      trigger,
      subject: { kind: 'review', ref: review.id },
      projectId: null,
    }
  })
}

/**
 * Event triggers (new issue, reviews) read since the cursor and fire per subject; rate triggers
 * read their sliding window. Regressions are not here: studio alerts on them as ingest reports
 * them. Studio throttles and dedupes; this only finds what holds.
 */
export async function evaluateRule(rule: AlertRule, now = new Date()): Promise<AlertEvaluation> {
  const since = cursorFor(rule, now)
  const firings: AlertFiring[] = []
  let cursor = now
  let isActive = false
  for (const trigger of rule.triggers) {
    if (trigger === 'new_issue') {
      const found = await newIssues(rule, since, now)
      firings.push(...found.firings)
      cursor = found.cursor
    } else if (trigger === 'issue_frequency' || trigger === 'error_rate') {
      const found =
        trigger === 'issue_frequency'
          ? await frequentIssues(rule, now)
          : await busyProjects(rule, now)
      firings.push(...found)
      isActive = found.length > 0
    } else if (trigger === 'review_failed' || trigger === 'blocking_review') {
      firings.push(...(await finishedReviews(rule, trigger, since, now)))
    }
  }
  return { firings, isActive, cursor }
}
