import { projectTable, releaseTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { desc, eq, inArray } from 'drizzle-orm'
import { commitTargetOf, currentReleases, pairKey } from '../../releases'
import { TREND_DAYS } from '../tracker/constants'
import { RELEASE_LIST_LIMIT } from './constants'
import {
  commitCountsOf,
  deployedCurrentsOf,
  deploysOf,
  eventStatsOf,
  newIssueCountsOf,
  trendsOf,
} from './release-reads'
import type { DeploySummary, ReleaseSummary } from './types'
import { releaseEnvironmentsOf } from './utils'

/** Newest releases first, each with what it brought, where it runs and what went into it. */
export const getReleases = async (projectIds?: string[]): Promise<ReleaseSummary[]> => {
  if (projectIds?.length === 0) return []
  const rows = await db
    .select({ release: releaseTable, projectRepository: projectTable.repository })
    .from(releaseTable)
    .innerJoin(projectTable, eq(projectTable.id, releaseTable.projectId))
    .where(projectIds ? inArray(releaseTable.projectId, projectIds) : undefined)
    .orderBy(desc(releaseTable.firstSeen))
    .limit(RELEASE_LIST_LIMIT)
  if (rows.length === 0) return []

  const keys = rows.map(({ release }) => ({
    projectId: release.projectId,
    version: release.version,
  }))
  const ids = rows.map(({ release }) => release.id)
  const projects = [...new Set(keys.map((key) => key.projectId))]
  const [stats, trends, newIssues, deploys, deployed, commitCounts] = await Promise.all([
    eventStatsOf(keys),
    trendsOf(keys, new Date()),
    newIssueCountsOf(projects, [...new Set(keys.map((key) => key.version))]),
    deploysOf(ids),
    deployedCurrentsOf(projects),
    commitCountsOf(ids),
  ])

  const deploysByRelease = new Map<string, DeploySummary[]>()
  for (const deploy of deploys) {
    deploysByRelease.set(deploy.releaseId, [
      ...(deploysByRelease.get(deploy.releaseId) ?? []),
      deploy,
    ])
  }
  const currents = currentReleases(
    rows.map(({ release }) => ({
      id: release.id,
      projectId: release.projectId,
      firstSeen: release.firstSeen,
      environments: stats.get(pairKey(release.projectId, release.version))?.environments ?? [],
    })),
    deployed,
  )

  return rows.map(({ release, projectRepository }) => {
    const key = pairKey(release.projectId, release.version)
    const releaseStats = stats.get(key)
    const releaseDeploys = deploysByRelease.get(release.id) ?? []
    const target = commitTargetOf(release, projectRepository)
    return {
      id: release.id,
      projectId: release.projectId,
      release: release.version,
      environment: releaseStats?.environment ?? releaseDeploys[0]?.environment ?? null,
      environments: releaseEnvironmentsOf(
        release,
        releaseStats?.environments ?? [],
        releaseDeploys,
        currents,
      ),
      firstSeen: release.firstSeen,
      lastSeen: release.lastSeen,
      events: releaseStats?.events ?? 0,
      issues: releaseStats?.issues ?? 0,
      newIssues: newIssues.get(key)?.total ?? 0,
      newErrors: newIssues.get(key)?.errors ?? 0,
      trend: trends.get(key) ?? new Array<number>(TREND_DAYS).fill(0),
      commitCount: commitCounts.get(release.id) ?? 0,
      lastDeploy: releaseDeploys[0] ?? null,
      repository: target.repository,
      commitSha: target.sha,
    }
  })
}
