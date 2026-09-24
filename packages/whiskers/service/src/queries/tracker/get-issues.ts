import { type Issue, issueTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { desc, eq, sql } from 'drizzle-orm'

export type IssueWithRelease = Issue & { lastRelease: string | null }

// Written as raw SQL on purpose: drizzle renders a correlated subquery's columns unqualified, so
// `issue_id = id` would resolve both sides against event.
const LAST_RELEASE = sql<string | null>`(
  select e.release from event e
  where e.issue_id = "issue"."id" and e.release is not null
  order by e.received_at desc limit 1
)`

export const getIssues = async (projectId?: string): Promise<IssueWithRelease[]> => {
  const query = db
    .select({ issue: issueTable, lastRelease: LAST_RELEASE })
    .from(issueTable)
    .orderBy(desc(issueTable.lastSeen))
    .limit(200)
  const rows = projectId ? await query.where(eq(issueTable.projectId, projectId)) : await query
  return rows.map(({ issue, lastRelease }) => ({ ...issue, lastRelease }))
}
