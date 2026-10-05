import type { Event, Issue, IssueTransition, issueTable } from '@code-whiskers/whiskers-domain'
import type { db } from '@code-whiskers/whiskers-repository'
import type { PgUpdateSetSource } from 'drizzle-orm/pg-core'

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export interface IngestOutcome {
  stored: Event
  transition: IssueTransition | null
}

export type IssuePatch = PgUpdateSetSource<typeof issueTable>

export type IssueLifecycle = Pick<
  Issue,
  | 'id'
  | 'projectId'
  | 'status'
  | 'resolvedInRelease'
  | 'resolvedAt'
  | 'archivedUntil'
  | 'archiveUntilEvents'
  | 'archiveUntilUsers'
  | 'regressedAt'
  | 'eventCount'
  | 'userCount'
  | 'lastRelease'
>
