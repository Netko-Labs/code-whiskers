import { type SavedQueryCreate, savedQuery } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq } from 'drizzle-orm'

export type SavedQueryRecord = typeof savedQuery.$inferSelect

export const getSavedQueries = async (userId: string): Promise<SavedQueryRecord[]> =>
  await db
    .select()
    .from(savedQuery)
    .where(eq(savedQuery.userId, userId))
    .orderBy(desc(savedQuery.createdAt))

export const createSavedQuery = async (userId: string, input: SavedQueryCreate) => {
  const [row] = await db
    .insert(savedQuery)
    .values({ ...input, userId })
    .returning({ id: savedQuery.id })
  return row ?? null
}

export const deleteSavedQuery = async (userId: string, id: string): Promise<boolean> => {
  const rows = await db
    .delete(savedQuery)
    .where(and(eq(savedQuery.id, id), eq(savedQuery.userId, userId)))
    .returning({ id: savedQuery.id })
  return rows.length > 0
}
