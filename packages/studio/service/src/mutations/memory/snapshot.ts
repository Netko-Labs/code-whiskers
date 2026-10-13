import { memoryActivity, memoryNote } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq } from 'drizzle-orm'
import type { Actor, NoteSnapshot } from './types'

type Action = (typeof memoryActivity.$inferInsert)['action']
type Executor = Pick<typeof db, 'insert' | 'select'>

export function snapshotOf(note: typeof memoryNote.$inferSelect): NoteSnapshot {
  return {
    id: note.id,
    installationId: note.installationId,
    repositoryId: note.repositoryId,
    kind: note.kind,
    body: note.body,
    paths: note.paths,
    source: note.source,
    sourceUrl: note.sourceUrl,
    authorUserId: note.authorUserId,
    authorLabel: note.authorLabel,
    status: note.status,
  }
}

export async function loadNote(id: string, executor: Executor = db) {
  const [note] = await executor.select().from(memoryNote).where(eq(memoryNote.id, id)).limit(1)
  return note ?? null
}

export async function recordActivity(
  executor: Executor,
  action: Action,
  actor: Actor,
  before: NoteSnapshot | null,
  after: NoteSnapshot | null,
): Promise<void> {
  const note = after ?? before
  if (!note) return
  await executor.insert(memoryActivity).values({
    installationId: note.installationId,
    noteId: note.id,
    action,
    actorUserId: actor.userId ?? null,
    actorLabel: actor.label ?? null,
    before,
    after,
  })
}
