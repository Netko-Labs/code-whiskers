import { memoryActivity, memoryNote } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq } from 'drizzle-orm'
import { isInstallationMember } from '../../queries/github'
import { loadNote, recordActivity, snapshotOf } from './snapshot'
import type { NoteSnapshot } from './types'

/**
 * Puts a note back the way it was before one change: a creation is removed, a deletion is
 * re-inserted under its old id, anything else restores the `before` fields.
 */
export const undoMemoryActivity = async (userId: string, activityId: string): Promise<boolean> => {
  const [entry] = await db
    .select()
    .from(memoryActivity)
    .where(eq(memoryActivity.id, activityId))
    .limit(1)
  if (!entry || entry.undoneAt || entry.action === 'undone') return false
  if (!(await isInstallationMember(userId, entry.installationId))) return false
  const before = entry.before as NoteSnapshot | null

  return await db.transaction(async (tx) => {
    const current = await loadNote(entry.noteId, tx)
    if (entry.action === 'created') {
      if (!current) return false
      await tx.delete(memoryNote).where(eq(memoryNote.id, current.id))
      await recordActivity(tx, 'undone', { userId }, snapshotOf(current), null)
    } else if (!before) {
      return false
    } else if (current) {
      const { id: _id, installationId: _installation, ...fields } = before
      const [after] = await tx
        .update(memoryNote)
        .set(fields)
        .where(eq(memoryNote.id, current.id))
        .returning()
      if (after)
        await recordActivity(tx, 'undone', { userId }, snapshotOf(current), snapshotOf(after))
    } else {
      const [after] = await tx.insert(memoryNote).values(before).returning()
      if (after) await recordActivity(tx, 'undone', { userId }, null, snapshotOf(after))
    }
    await tx
      .update(memoryActivity)
      .set({ undoneAt: new Date() })
      .where(eq(memoryActivity.id, entry.id))
    return true
  })
}
