import { issueTable, projectTable, releaseTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, eq } from 'drizzle-orm'
import {
  commitTargetOf,
  MAX_SUSPECT_COMMITS,
  requestCommitSync,
  suspectMatchesOf,
} from '../../releases'
import { FIRST_RELEASE } from '../tracker/issue-row'
import { isUuid } from '../tracker/utils'
import { commitsOf, inAppFramesOf, reviewVerdictsOf } from './release-commits'
import type { SuspectCommits } from './types'

const NONE: SuspectCommits = { version: null, commitStatus: null, commits: [] }

/**
 * Commits of the issue's first release that changed a file its stack runs through — the likely
 * cause, Sentry-style. `null` when the issue does not exist.
 */
export const getSuspectCommits = async (issueId: string): Promise<SuspectCommits | null> => {
  if (!isUuid(issueId)) return null
  const [issue] = await db
    .select({ projectId: issueTable.projectId, firstRelease: FIRST_RELEASE })
    .from(issueTable)
    .where(eq(issueTable.id, issueId))
    .limit(1)
  if (!issue) return null
  if (!issue.firstRelease) return NONE

  const [row] = await db
    .select({ release: releaseTable, projectRepository: projectTable.repository })
    .from(releaseTable)
    .innerJoin(projectTable, eq(projectTable.id, releaseTable.projectId))
    .where(
      and(
        eq(releaseTable.projectId, issue.projectId),
        eq(releaseTable.version, issue.firstRelease),
      ),
    )
    .limit(1)
  if (!row) return { ...NONE, version: issue.firstRelease }
  const target = commitTargetOf(row.release, row.projectRepository)

  const [commits, frames] = await Promise.all([commitsOf(row.release.id), inAppFramesOf([issueId])])
  const matches = suspectMatchesOf(commits, frames.get(issueId) ?? []).slice(0, MAX_SUSPECT_COMMITS)
  const bySha = new Map(commits.map((commit) => [commit.sha, commit]))
  const verdicts = await reviewVerdictsOf(
    target.repository,
    matches.flatMap((match) => bySha.get(match.sha)?.prNumber ?? []),
  )
  return {
    version: row.release.version,
    commitStatus: requestCommitSync(row.release, target),
    commits: matches.flatMap((match) => {
      const commit = bySha.get(match.sha)
      if (!commit) return []
      const review = commit.prNumber ? (verdicts.get(commit.prNumber) ?? null) : null
      return [{ ...commit, review, matchedFiles: match.matchedFiles }]
    }),
  }
}
