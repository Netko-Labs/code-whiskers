import {
  organization,
  organizationMember,
  repository,
  reviewRule,
  user,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import type { RepositoryRule, ReviewRuleRecord } from './types'

export const getRulesForUser = async (userId: string): Promise<ReviewRuleRecord[]> => {
  return await db
    .select({
      id: reviewRule.id,
      installationId: reviewRule.installationId,
      organization: organization.login,
      body: reviewRule.body,
      scope: reviewRule.scope,
      effect: reviewRule.effect,
      isMuted: reviewRule.isMuted,
      authorName: user.name,
      createdAt: reviewRule.createdAt,
    })
    .from(reviewRule)
    .innerJoin(organization, eq(organization.installationId, reviewRule.installationId))
    .innerJoin(
      organizationMember,
      and(
        eq(organizationMember.installationId, reviewRule.installationId),
        eq(organizationMember.userId, userId),
      ),
    )
    .leftJoin(user, eq(user.id, reviewRule.authorUserId))
    .orderBy(desc(reviewRule.createdAt))
}

/** Unmuted rules for the installation a repository belongs to — what the reviewer is told. */
export const getRulesForRepository = async (slug: string): Promise<RepositoryRule[]> => {
  const [owner, name] = slug.split('/')
  if (!owner || !name) return []
  return await db
    .select({ body: reviewRule.body, scope: reviewRule.scope, effect: reviewRule.effect })
    .from(reviewRule)
    .innerJoin(repository, eq(repository.installationId, reviewRule.installationId))
    .where(
      and(
        eq(reviewRule.isMuted, false),
        eq(sql`lower(${repository.owner})`, owner.toLowerCase()),
        eq(sql`lower(${repository.name})`, name.toLowerCase()),
      ),
    )
    .orderBy(asc(reviewRule.createdAt))
}
