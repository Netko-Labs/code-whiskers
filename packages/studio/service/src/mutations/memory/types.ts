import type { memoryNote } from '@code-whiskers/studio-domain'

type Note = typeof memoryNote.$inferSelect

/** A note as the activity log stores it, enough to put it back exactly. */
export type NoteSnapshot = Pick<
  Note,
  | 'id'
  | 'installationId'
  | 'repositoryId'
  | 'kind'
  | 'body'
  | 'paths'
  | 'source'
  | 'sourceUrl'
  | 'authorUserId'
  | 'authorLabel'
  | 'status'
>

export interface Actor {
  userId?: string
  label?: string
}
