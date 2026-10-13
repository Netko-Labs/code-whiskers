import { type MemoryLearn, memoryNote } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { findRepositoryBySlug } from '../../queries/memory'
import { recordActivity, snapshotOf } from './snapshot'

/**
 * A note whiskers learned on its own. It applies immediately; the activity log is where a human
 * audits and undoes it. The same lesson twice is one note, not two.
 */
export const learnMemoryNote = async (input: MemoryLearn): Promise<{ id: string } | null> => {
  const repo = await findRepositoryBySlug(input.repo)
  if (!repo) return null
  const [existing] = await db
    .select({ id: memoryNote.id })
    .from(memoryNote)
    .where(
      and(
        eq(memoryNote.repositoryId, repo.id),
        eq(memoryNote.kind, input.kind),
        eq(memoryNote.status, 'active'),
        eq(sql`lower(${memoryNote.body})`, input.body.toLowerCase()),
      ),
    )
    .limit(1)
  if (existing) return existing
  return await db.transaction(async (tx) => {
    const [note] = await tx
      .insert(memoryNote)
      .values({
        installationId: repo.installationId,
        repositoryId: repo.id,
        kind: input.kind,
        body: input.body,
        paths: input.paths,
        source: input.source,
        sourceUrl: input.sourceUrl ?? null,
        authorLabel: input.actor,
      })
      .returning()
    if (!note) return null
    await recordActivity(tx, 'created', { label: input.actor }, null, snapshotOf(note))
    return { id: note.id }
  })
}

/** The reviewer read these notes for a review; how often a note is used is how it earns trust. */
export const markMemoryUsed = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return
  await db
    .update(memoryNote)
    .set({ uses: sql`${memoryNote.uses} + 1`, lastUsedAt: new Date() })
    .where(inArray(memoryNote.id, ids))
}
