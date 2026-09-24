import { findingTable, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, desc, eq, gt, inArray } from 'drizzle-orm'
import { codeOwnersFor, ownersOf } from './code-owners'
import { HOTSPOT_WINDOW_MS } from './constants'
import type { Hotspot } from './types'
import { directoryOf } from './utils'

/**
 * Where findings concentrate. Only the newest completed review of each PR counts — every push
 * re-raises what is still there, and counting all of them would reward the busiest branch.
 */
export const getHotspots = async (): Promise<Hotspot[]> => {
  const latest = db
    .selectDistinctOn([reviewTable.owner, reviewTable.repo, reviewTable.prNumber], {
      id: reviewTable.id,
    })
    .from(reviewTable)
    .where(
      and(
        eq(reviewTable.status, 'completed'),
        gt(reviewTable.createdAt, new Date(Date.now() - HOTSPOT_WINDOW_MS)),
      ),
    )
    .orderBy(reviewTable.owner, reviewTable.repo, reviewTable.prNumber, desc(reviewTable.createdAt))

  const rows = await db
    .select({
      owner: reviewTable.owner,
      repo: reviewTable.repo,
      prNumber: reviewTable.prNumber,
      createdAt: reviewTable.createdAt,
      file: findingTable.file,
      severity: findingTable.severity,
    })
    .from(findingTable)
    .innerJoin(reviewTable, eq(findingTable.reviewId, reviewTable.id))
    .where(inArray(findingTable.reviewId, latest))

  const spots = new Map<string, Omit<Hotspot, 'owners'> & { prs: Set<number> }>()
  for (const row of rows) {
    const repository = `${row.owner}/${row.repo}`
    const directory = directoryOf(row.file)
    const key = `${repository}\u0000${directory}`
    const spot = spots.get(key) ?? {
      repository,
      directory,
      findings: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      pullRequests: 0,
      lastSeen: row.createdAt,
      prs: new Set<number>(),
    }
    spot.findings += 1
    spot[row.severity] += 1
    spot.prs.add(row.prNumber)
    if (row.createdAt > spot.lastSeen) spot.lastSeen = row.createdAt
    spots.set(key, spot)
  }

  const repositories = [...new Set([...spots.values()].map((spot) => spot.repository))]
  const rulesByRepo = new Map(
    await Promise.all(
      repositories.map(
        async (repository) => [repository, await codeOwnersFor(repository)] as const,
      ),
    ),
  )
  return [...spots.values()]
    .map(({ prs, ...spot }) => ({
      ...spot,
      pullRequests: prs.size,
      owners: ownersOf(`${spot.directory}/_`, rulesByRepo.get(spot.repository) ?? []),
    }))
    .sort((a, b) => b.critical + b.high - (a.critical + a.high) || b.findings - a.findings)
}
