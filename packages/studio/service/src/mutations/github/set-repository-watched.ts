import { repository } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { eq } from 'drizzle-orm'
import { isInstallationMember } from '../../queries/github'

/** The sync never touches is_watched, so a pause survives every re-sync. */
export const setRepositoryWatched = async (
  userId: string,
  id: number,
  isWatched: boolean,
): Promise<boolean> => {
  const [row] = await db.select().from(repository).where(eq(repository.id, id)).limit(1)
  if (!row || !(await isInstallationMember(userId, row.installationId))) return false
  await db.update(repository).set({ isWatched }).where(eq(repository.id, id))
  return true
}
