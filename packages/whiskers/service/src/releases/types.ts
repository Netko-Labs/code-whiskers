import type { Release, ReleaseCommit } from '@code-whiskers/whiskers-domain'
import type { Octokit } from 'octokit'

export interface RepoRef {
  octokit: Octokit
  owner: string
  repo: string
}

export type CommitStatus = 'synced' | 'pending' | 'failed' | 'no-repository' | 'no-commit'

/** Where a release's commits come from: its own repository and sha, or the project's fallbacks. */
export interface CommitTarget {
  repository: string | null
  sha: string | null
}

export type ReleaseRef = Pick<Release, 'version' | 'repository' | 'commitSha'>

export type FetchedCommit = Omit<ReleaseCommit, 'releaseId'>

export type CommitFiles = Pick<ReleaseCommit, 'sha' | 'files'>

export interface SuspectMatch {
  sha: string
  matchedFiles: string[]
}

export interface ReleaseCurrentKey {
  projectId: string
  environment: string
  releaseId: string
}

export interface EnvironmentCandidate {
  id: string
  projectId: string
  firstSeen: Date
  environments: string[]
}

export interface ResolvedWindow {
  /** Resolve-in-next-release decisions made in `[nextFrom, nextUntil)` ship in this release. */
  nextFrom: Date | null
  nextUntil: Date
  /** Resolve-now decisions made in `[nowFrom, nowUntil)` happened while it was the latest. */
  nowFrom: Date
  nowUntil: Date | null
}
