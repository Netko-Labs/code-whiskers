import type { Release, ReleaseCommit } from '@code-whiskers/whiskers-domain'
import type { CommitStatus } from '../../releases'
import type { HistogramBucket, IssueRow, NamedCount } from '../tracker/types'

export interface ReleaseKey {
  projectId: string
  version: string
}

export interface ReleaseEventStats {
  events: number
  issues: number
  users: number
  environments: string[]
  /** The environment most of its events came from. */
  environment: string | null
}

export interface NewIssueCount {
  total: number
  errors: number
}

export interface DeploySummary {
  id: string
  releaseId: string
  environment: string
  deployedAt: Date
  url: string | null
  name: string | null
}

export interface ReleaseEnvironment {
  name: string
  isCurrent: boolean
  deployedAt: Date | null
}

export interface ReleaseSummary {
  id: string
  projectId: string
  /** The version; named `release` like the events that carry it. */
  release: string
  environment: string | null
  environments: ReleaseEnvironment[]
  firstSeen: Date
  lastSeen: Date
  events: number
  issues: number
  newIssues: number
  newErrors: number
  /** Daily events, oldest first, today last. */
  trend: number[]
  commitCount: number
  lastDeploy: DeploySummary | null
  repository: string | null
  commitSha: string | null
}

export interface ReviewVerdict {
  id: string
  status: string
  verdict: string | null
}

export type CommitView = Omit<ReleaseCommit, 'releaseId'> & {
  review: ReviewVerdict | null
  /** New issues of this release whose stack runs through a file the commit changed. */
  suspectIssueIds: string[]
}

export type SuspectCommit = Omit<ReleaseCommit, 'releaseId'> & {
  review: ReviewVerdict | null
  matchedFiles: string[]
}

export type DeployEntry = DeploySummary & {
  version: string
  /** The newest deploy of its environment: what runs there now. */
  isActive: boolean
  isThisRelease: boolean
}

export interface ReleaseDetail {
  release: Release
  previousVersion: string | null
  commitStatus: CommitStatus
  stats: { events: number; issues: number; users: number; newIssues: number }
  environments: NamedCount[]
  histogram: HistogramBucket[]
  newIssues: IssueRow[]
  regressedIssues: IssueRow[]
  resolvedIssues: IssueRow[]
  commits: CommitView[]
  deploys: DeployEntry[]
}

export interface SuspectCommits {
  version: string | null
  commitStatus: CommitStatus | null
  commits: SuspectCommit[]
}

export interface Neighbours {
  previous: Pick<Release, 'version' | 'firstSeen'> | null
  next: Pick<Release, 'version' | 'firstSeen'> | null
}
