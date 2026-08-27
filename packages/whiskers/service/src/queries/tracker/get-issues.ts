import { type Issue, issueTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { desc, eq } from 'drizzle-orm'

export const getIssues = async (projectId?: string): Promise<Issue[]> => {
  const query = db.select().from(issueTable).orderBy(desc(issueTable.lastSeen)).limit(100)
  if (projectId) return await query.where(eq(issueTable.projectId, projectId))
  return await query
}
