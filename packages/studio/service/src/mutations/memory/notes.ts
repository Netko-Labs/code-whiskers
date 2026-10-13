import {
  type MemoryNoteCreate,
  type MemoryNoteUpdate,
  memoryNote,
  repository,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq } from 'drizzle-orm'
import { isInstallationMember } from '../../queries/github'
import { loadNote, recordActivity, snapshotOf } from './snapshot'

async function repositoryBelongs(repositoryId: number | null, installationId: number) {
  if (repositoryId === null) return true
  const [row] = await db
    .select({ id: repository.id })
    .from(repository)
    .where(and(eq(repository.id, repositoryId), eq(repository.installationId, installationId)))
    .limit(1)
  return Boolean(row)
}

export const createMemoryNote = async (
  userId: string,
  input: MemoryNoteCreate,
): Promise<{ id: string } | null> => {
  if (!(await isInstallationMember(userId, input.installationId))) return null
  if (!(await repositoryBelongs(input.repositoryId, input.installationId))) return null
  return await db.transaction(async (tx) => {
    const [note] = await tx
      .insert(memoryNote)
      .values({ ...input, source: 'human', authorUserId: userId })
      .returning()
    if (!note) return null
    await recordActivity(tx, 'created', { userId }, null, snapshotOf(note))
    return { id: note.id }
  })
}

/** Anyone on the installation may edit its notes — they are the team's, not the author's. */
export const updateMemoryNote = async (
  userId: string,
  id: string,
  patch: MemoryNoteUpdate,
): Promise<boolean> => {
  const before = await loadNote(id)
  if (!before || !(await isInstallationMember(userId, before.installationId))) return false
  if (patch.repositoryId !== undefined) {
    if (!(await repositoryBelongs(patch.repositoryId, before.installationId))) return false
  }
  const action =
    patch.status && patch.status !== before.status
      ? patch.status === 'retired'
        ? 'retired'
        : 'restored'
      : 'edited'
  await db.transaction(async (tx) => {
    const [after] = await tx.update(memoryNote).set(patch).where(eq(memoryNote.id, id)).returning()
    if (after) await recordActivity(tx, action, { userId }, snapshotOf(before), snapshotOf(after))
  })
  return true
}

export const deleteMemoryNote = async (userId: string, id: string): Promise<boolean> => {
  const before = await loadNote(id)
  if (!before || !(await isInstallationMember(userId, before.installationId))) return false
  await db.transaction(async (tx) => {
    await tx.delete(memoryNote).where(eq(memoryNote.id, id))
    await recordActivity(tx, 'deleted', { userId }, snapshotOf(before), null)
  })
  return true
}
