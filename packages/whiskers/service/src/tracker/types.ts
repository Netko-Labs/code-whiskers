import type { Issue } from '@code-whiskers/whiskers-domain'

export type IngestBody =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; status: 400 | 413 | 415; error: string }

export type IssueLifecycleFields = Pick<
  Issue,
  | 'status'
  | 'resolvedInRelease'
  | 'resolvedAt'
  | 'archivedUntil'
  | 'archiveUntilEvents'
  | 'archiveUntilUsers'
  | 'eventCount'
  | 'userCount'
>

export interface IngestedEventContext {
  release: string | null
  /** When `release` first reached the project; only looked up when `needsReleaseAge` says so. */
  releaseFirstSeenAt: Date | null
  now: Date
}
