import { createLogger } from '@code-whiskers/logger'
import { reportError } from '@code-whiskers/observability/server'
import {
  projectTable,
  type Release,
  releaseCommitTable,
  releaseTable,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, desc, eq, lt, ne, sql } from 'drizzle-orm'
import { announce } from '../realtime'
import { octokitFor } from '../review/github'
import {
  COMMIT_FETCH_CONCURRENCY,
  MAX_RELEASE_COMMITS,
  PREVIOUS_RELEASE_LOOKBACK,
} from './constants'
import { compareShas, fetchCommit } from './github'
import type { CommitStatus, CommitTarget, FetchedCommit } from './types'
import { commitStatusOf, commitTargetOf, mapLimit } from './utils'

const logger = createLogger('whiskers-releases')
const inFlight = new Set<string>()
const failedAt = new Map<string, number>()

const sameRepository = (a: string | null, b: string) => a?.toLowerCase() === b.toLowerCase()

/** The sha the range starts from: the newest earlier release of the same repository that has one. */
async function previousShaOf(
  release: Release,
  repository: string,
  projectRepository: string | null,
): Promise<string | null> {
  const earlier = await db
    .select()
    .from(releaseTable)
    .where(
      and(
        eq(releaseTable.projectId, release.projectId),
        ne(releaseTable.id, release.id),
        lt(releaseTable.firstSeen, release.firstSeen),
      ),
    )
    .orderBy(desc(releaseTable.firstSeen))
    .limit(PREVIOUS_RELEASE_LOOKBACK)
  for (const candidate of earlier) {
    const target = commitTargetOf(candidate, projectRepository)
    if (target.sha && sameRepository(target.repository, repository)) return target.sha
  }
  return null
}

async function readCommits(
  repository: string,
  sha: string,
  previous: string | null,
): Promise<FetchedCommit[]> {
  if (previous === sha) return []
  const [owner = '', repo = ''] = repository.split('/')
  const ref = { octokit: await octokitFor(owner, repo), owner, repo }
  const range = previous ? await compareShas(ref, previous, sha) : null
  const shas = (range ?? [sha]).slice(-MAX_RELEASE_COMMITS)
  const commits = await mapLimit(shas, COMMIT_FETCH_CONCURRENCY, (one) => fetchCommit(ref, one))
  return commits.filter((commit): commit is FetchedCommit => commit !== null).reverse()
}

async function sync(releaseId: string): Promise<void> {
  const [row] = await db
    .select({ release: releaseTable, projectRepository: projectTable.repository })
    .from(releaseTable)
    .innerJoin(projectTable, eq(projectTable.id, releaseTable.projectId))
    .where(eq(releaseTable.id, releaseId))
    .limit(1)
  if (!row) return
  const { release, projectRepository } = row
  const { repository, sha } = commitTargetOf(release, projectRepository)
  if (!repository || !sha) return

  const previous = await previousShaOf(release, repository, projectRepository)
  const commits = await readCommits(repository, sha, previous)
  await db.transaction(async (tx) => {
    await tx.delete(releaseCommitTable).where(eq(releaseCommitTable.releaseId, release.id))
    if (commits.length > 0) {
      await tx
        .insert(releaseCommitTable)
        .values(commits.map((commit) => ({ ...commit, releaseId: release.id })))
        .onConflictDoNothing()
    }
    // A deploy that moved the sha meanwhile resets the mark, and the next read syncs again.
    await tx
      .update(releaseTable)
      .set({ commitsSyncedAt: new Date() })
      .where(
        and(
          eq(releaseTable.id, release.id),
          sql`${releaseTable.commitSha} is not distinct from ${release.commitSha}`,
        ),
      )
  })
  logger.info({ releaseId, repository, commits: commits.length }, 'release commits synced')
  announce('issues')
}

/** Fire-and-forget: reads the release's commit range from GitHub once at a time per release. */
export async function syncReleaseCommits(releaseId: string): Promise<void> {
  if (inFlight.has(releaseId)) return
  inFlight.add(releaseId)
  try {
    await sync(releaseId)
    failedAt.delete(releaseId)
  } catch (error) {
    failedAt.set(releaseId, Date.now())
    logger.warn({ releaseId, err: (error as Error).message }, 'release commit sync failed')
    reportError(error, { tags: { task: 'release-commits' } })
  } finally {
    inFlight.delete(releaseId)
  }
}

/** Where the release's commits stand; a release that could sync but never did starts now. */
export function requestCommitSync(release: Release, target: CommitTarget): CommitStatus {
  const status = commitStatusOf(release, target, failedAt.get(release.id), Date.now())
  if (status === 'pending') void syncReleaseCommits(release.id)
  return status
}
