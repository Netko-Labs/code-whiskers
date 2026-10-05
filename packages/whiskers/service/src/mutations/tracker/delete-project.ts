import { projectTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { eq } from 'drizzle-orm'
import { announce } from '../../realtime'
import { postToStudio } from '../../review/studio-client'

/**
 * Keys, issues, events, logs and spans go with the project (FK cascade). Studio is told so it can
 * drop the triage rows under `project:<id>`; ids come from a sequence, so none is ever reused.
 */
export async function deleteProject(id: string): Promise<boolean> {
  const [deleted] = await db
    .delete(projectTable)
    .where(eq(projectTable.id, id))
    .returning({ id: projectTable.id })
  if (!deleted) return false
  for (const topic of ['issues', 'logs', 'traces'] as const) announce(topic)
  void postToStudio('projects/deleted', { projectId: id })
  return true
}
