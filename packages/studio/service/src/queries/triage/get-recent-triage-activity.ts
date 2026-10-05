import { organizationMember, repository, triageActivity, user } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, like, sql } from 'drizzle-orm'
import { hasInstanceAccess } from '../github'
import { PROJECT_SCOPE_PREFIX } from './authorize-triage-scope'
import type { RecentTriageActivity } from './types'

const COLUMNS = {
  id: triageActivity.id,
  scope: triageActivity.scope,
  itemKind: triageActivity.itemKind,
  itemRef: triageActivity.itemRef,
  kind: triageActivity.kind,
  actorUserId: triageActivity.actorUserId,
  actorName: user.name,
  actorImage: user.image,
  data: triageActivity.data,
  createdAt: triageActivity.createdAt,
}

/** The newest activity across every item the user may see: the console's live feed. */
export const getRecentTriageActivity = async (
  userId: string,
  limit: number,
): Promise<RecentTriageActivity[]> => {
  const canSeeProjects = await hasInstanceAccess(userId)
  const [onRepositories, onProjects] = await Promise.all([
    db
      .select(COLUMNS)
      .from(triageActivity)
      .leftJoin(user, eq(user.id, triageActivity.actorUserId))
      .innerJoin(
        repository,
        eq(triageActivity.scope, sql`${repository.owner} || '/' || ${repository.name}`),
      )
      .innerJoin(
        organizationMember,
        and(
          eq(organizationMember.installationId, repository.installationId),
          eq(organizationMember.userId, userId),
        ),
      )
      .orderBy(desc(triageActivity.createdAt))
      .limit(limit),
    canSeeProjects
      ? db
          .select(COLUMNS)
          .from(triageActivity)
          .leftJoin(user, eq(user.id, triageActivity.actorUserId))
          .where(like(triageActivity.scope, `${PROJECT_SCOPE_PREFIX}%`))
          .orderBy(desc(triageActivity.createdAt))
          .limit(limit)
      : Promise.resolve([]),
  ])
  return [...onRepositories, ...onProjects]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
}
