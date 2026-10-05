import {
  type AlertFiringsQuery,
  alertFiring,
  alertRule,
  organizationMember,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq } from 'drizzle-orm'
import type { AlertFiringRecord } from './types'

/** Newest first, across the caller's installations or for one rule. */
export const getAlertFiringsForUser = async (
  userId: string,
  { ruleId, limit }: AlertFiringsQuery,
): Promise<AlertFiringRecord[]> => {
  return await db
    .select({
      id: alertFiring.id,
      ruleId: alertFiring.ruleId,
      ruleName: alertRule.name,
      installationId: alertFiring.installationId,
      trigger: alertFiring.trigger,
      subjectKind: alertFiring.subjectKind,
      subjectRef: alertFiring.subjectRef,
      projectId: alertFiring.projectId,
      title: alertFiring.title,
      text: alertFiring.text,
      url: alertFiring.url,
      status: alertFiring.status,
      deliveries: alertFiring.deliveries,
      createdAt: alertFiring.createdAt,
    })
    .from(alertFiring)
    .innerJoin(alertRule, eq(alertRule.id, alertFiring.ruleId))
    .innerJoin(
      organizationMember,
      and(
        eq(organizationMember.installationId, alertFiring.installationId),
        eq(organizationMember.userId, userId),
      ),
    )
    .where(ruleId ? eq(alertFiring.ruleId, ruleId) : undefined)
    .orderBy(desc(alertFiring.createdAt))
    .limit(limit)
}
