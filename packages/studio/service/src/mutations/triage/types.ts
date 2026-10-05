import type { IssueLifecycle, WhiskersLifecycleBody } from '@code-whiskers/studio-domain'

export type LifecycleDecision = Omit<WhiskersLifecycleBody, 'issueIds' | 'projectId'>

export interface IssueDecision {
  status: 'open' | 'resolved' | 'archived'
  resolveMode: string | null
  archiveMode: string | null
  archiveValue: string | null
}

export interface MirrorGroup {
  projectId: string
  lifecycle: LifecycleDecision
  rows: MirrorRow[]
}

export interface IssueLifecycleResult {
  issues: IssueLifecycle[]
  /** False when whiskers could not take the write; studio's decision stands regardless. */
  mirrored: boolean
}

export interface MirrorRow {
  id: string
  scope: string
  itemRef: string
  status: string
  resolveMode: string | null
  archiveMode: string | null
  archiveValue: string | null
  snoozedUntil: Date | null
}
