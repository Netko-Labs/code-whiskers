import { organizationMember, repository, triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, like, sql } from 'drizzle-orm'
import { PROJECT_SCOPE_PREFIX } from './authorize-triage-scope'
import type { TriageRecord } from './types'

const TRIAGE_READ_LIMIT = 2_000

const COLUMNS = {
  scope: triageState.scope,
  itemKind: triageState.itemKind,
  itemRef: triageState.itemRef,
  status: triageState.status,
  assigneeUserId: triageState.assigneeUserId,
  snoozedUntil: triageState.snoozedUntil,
  note: triageState.note,
  updatedAt: triageState.updatedAt,
}

/** Every decision on a repository the user can see, plus every project decision. */
export const getTriageForUser = async (userId: string): Promise<TriageRecord[]> => {
  const [onRepositories, onProjects] = await Promise.all([
    db
      .select(COLUMNS)
      .from(triageState)
      .innerJoin(
        repository,
        eq(triageState.scope, sql`${repository.owner} || '/' || ${repository.name}`),
      )
      .innerJoin(
        organizationMember,
        and(
          eq(organizationMember.installationId, repository.installationId),
          eq(organizationMember.userId, userId),
        ),
      )
      .orderBy(desc(triageState.updatedAt))
      .limit(TRIAGE_READ_LIMIT),
    db
      .select(COLUMNS)
      .from(triageState)
      .where(like(triageState.scope, `${PROJECT_SCOPE_PREFIX}%`))
      .orderBy(desc(triageState.updatedAt))
      .limit(TRIAGE_READ_LIMIT),
  ])
  return [...onRepositories, ...onProjects]
}
