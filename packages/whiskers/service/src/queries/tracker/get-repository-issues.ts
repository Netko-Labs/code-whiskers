import { issueTable, projectTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, desc, eq, gt, isNotNull, sql } from 'drizzle-orm'
import type { RepositoryIssue } from './types'

const WINDOW_MS = 14 * 24 * 60 * 60 * 1000
const LIMIT = 200

/**
 * Open errors seen in the last two weeks in projects linked to this repository, with where in
 * the code they were thrown. A review matches them against the files it changes.
 */
export const getRepositoryIssues = async (slug: string): Promise<RepositoryIssue[]> => {
  return await db
    .select({
      id: issueTable.id,
      title: issueTable.title,
      culprit: issueTable.culprit,
      eventCount: issueTable.eventCount,
      userCount: issueTable.userCount,
      lastSeen: issueTable.lastSeen,
      regressedAt: issueTable.regressedAt,
    })
    .from(issueTable)
    .innerJoin(projectTable, eq(projectTable.id, issueTable.projectId))
    .where(
      and(
        eq(sql`lower(${projectTable.repository})`, slug.toLowerCase()),
        eq(issueTable.status, 'unresolved'),
        isNotNull(issueTable.culprit),
        gt(issueTable.lastSeen, new Date(Date.now() - WINDOW_MS)),
      ),
    )
    .orderBy(desc(issueTable.eventCount))
    .limit(LIMIT)
    .then((rows) => rows.map((row) => ({ ...row, culprit: row.culprit ?? '' })))
}
