import { type Project, projectTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { eq } from 'drizzle-orm'

export const getProject = async (id: string): Promise<Project | undefined> => {
  return await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.id, id))
    .then(([r]) => r)
}
