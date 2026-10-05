import { projectTable, type ReleaseDetailQuery, releaseTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, eq, sql } from 'drizzle-orm'
import { commitTargetOf, pairKey, requestCommitSync, suspectMatchesOf } from '../../releases'
import { asDate } from '../insights/utils'
import { BREAKDOWN_LIMIT, DAY_MS, TREND_DAYS } from '../tracker/constants'
import type { NamedCount } from '../tracker/types'
import { trendStartOf } from '../tracker/utils'
import { RELEASE_DEPLOY_LIMIT } from './constants'
import { commitsOf, inAppFramesOf, reviewVerdictsOf } from './release-commits'
import { neighboursOf, newIssueTotalOf, releaseIssuesOf } from './release-issues'
import { eventStatsOf, trendsOf } from './release-reads'
import type { CommitView, DeploySummary, ReleaseDetail } from './types'
import { deployTimelineOf } from './utils'

type Row = Record<string, unknown>

async function environmentCountsOf(projectId: string, version: string): Promise<NamedCount[]> {
  const rows = (await db.execute(sql`
    select environment, count(*)::int as n from event
    where project_id = ${projectId} and release = ${version} and environment is not null
    group by environment order by n desc limit ${BREAKDOWN_LIMIT}`)) as Row[]
  return rows.map((row) => ({ name: String(row.environment), count: Number(row.n) }))
}

/** The project's recent deploys with their versions: the timeline this release sits in. */
async function projectDeploysOf(projectId: string) {
  const rows = (await db.execute(sql`
    select d.id, d.release_id, d.environment, d.deployed_at, d.url, d.name, r.version
    from deploy d join release r on r.id = d.release_id
    where r.project_id = ${projectId}
    order by d.deployed_at desc limit ${RELEASE_DEPLOY_LIMIT}`)) as Row[]
  return rows.map((row): DeploySummary & { version: string } => ({
    id: String(row.id),
    releaseId: String(row.release_id),
    environment: String(row.environment),
    deployedAt: asDate(row.deployed_at),
    url: row.url ? String(row.url) : null,
    name: row.name ? String(row.name) : null,
    version: String(row.version),
  }))
}

/** One release read for a human: what it brought, what went into it, and where it runs. */
export const getRelease = async ({
  projectId,
  version,
}: ReleaseDetailQuery): Promise<ReleaseDetail | null> => {
  const [row] = await db
    .select({ release: releaseTable, projectRepository: projectTable.repository })
    .from(releaseTable)
    .innerJoin(projectTable, eq(projectTable.id, releaseTable.projectId))
    .where(and(eq(releaseTable.projectId, projectId), eq(releaseTable.version, version)))
    .limit(1)
  if (!row) return null
  const { release, projectRepository } = row
  const target = commitTargetOf(release, projectRepository)
  const now = new Date()
  const key = { projectId, version }

  const [neighbours, stats, trends, environments, newTotal, commits, deploys] = await Promise.all([
    neighboursOf(release),
    eventStatsOf([key]),
    trendsOf([key], now),
    environmentCountsOf(projectId, version),
    newIssueTotalOf(release),
    commitsOf(release.id),
    projectDeploysOf(projectId),
  ])
  const issues = await releaseIssuesOf(release, neighbours, now)
  const [verdicts, frames] = await Promise.all([
    reviewVerdictsOf(
      target.repository,
      commits.flatMap((commit) => (commit.prNumber ? [commit.prNumber] : [])),
    ),
    inAppFramesOf(issues.newIssues.map((issue) => issue.id)),
  ])

  const suspects = new Map<string, string[]>()
  for (const [issueId, paths] of frames) {
    for (const match of suspectMatchesOf(commits, paths)) {
      suspects.set(match.sha, [...(suspects.get(match.sha) ?? []), issueId])
    }
  }
  const commitViews: CommitView[] = commits.map((commit) => ({
    ...commit,
    review: commit.prNumber ? (verdicts.get(commit.prNumber) ?? null) : null,
    suspectIssueIds: suspects.get(commit.sha) ?? [],
  }))
  const releaseStats = stats.get(pairKey(projectId, version))
  const start = trendStartOf(now)

  return {
    release,
    previousVersion: neighbours.previous?.version ?? null,
    commitStatus: requestCommitSync(release, target),
    stats: {
      events: releaseStats?.events ?? 0,
      issues: releaseStats?.issues ?? 0,
      users: releaseStats?.users ?? 0,
      newIssues: newTotal,
    },
    environments,
    histogram: (trends.get(pairKey(projectId, version)) ?? new Array(TREND_DAYS).fill(0)).map(
      (value, index) => ({ bucket: new Date(start.getTime() + index * DAY_MS), count: value }),
    ),
    ...issues,
    commits: commitViews,
    deploys: deployTimelineOf(deploys, release.id),
  }
}
