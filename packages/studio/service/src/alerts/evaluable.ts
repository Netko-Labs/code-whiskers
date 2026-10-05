import { type AlertsEvaluated, alertRule, organization } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq, inArray, ne, sql } from 'drizzle-orm'
import type { EvaluableRule } from './types'

/** Every rule that is not muted, with its installation's login and nothing about delivery. */
export const getEvaluableRules = async (): Promise<EvaluableRule[]> => {
  return await db
    .select({
      id: alertRule.id,
      name: alertRule.name,
      triggers: alertRule.triggers,
      projectIds: alertRule.projectIds,
      environment: alertRule.environment,
      minLevel: alertRule.minLevel,
      release: alertRule.release,
      threshold: alertRule.threshold,
      windowMinutes: alertRule.windowMinutes,
      actionIntervalMinutes: alertRule.actionIntervalMinutes,
      state: alertRule.state,
      lastFiredAt: alertRule.lastFiredAt,
      lastEvaluatedAt: alertRule.lastEvaluatedAt,
      owner: sql<string>`lower(${organization.login})`,
    })
    .from(alertRule)
    .innerJoin(organization, eq(organization.installationId, alertRule.installationId))
    .where(and(ne(alertRule.state, 'muted'), sql`cardinality(${alertRule.triggers}) > 0`))
}

/** The worker's cursor: event triggers look back to here on the next pass. */
export const markRulesEvaluated = async ({ ids, at }: AlertsEvaluated): Promise<void> => {
  if (ids.length === 0) return
  await db.update(alertRule).set({ lastEvaluatedAt: at }).where(inArray(alertRule.id, ids))
}

export const quietAlertRule = async (id: string): Promise<void> => {
  await db
    .update(alertRule)
    .set({ state: 'armed' })
    .where(and(eq(alertRule.id, id), eq(alertRule.state, 'firing')))
}
