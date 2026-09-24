import {
  type AlertFire,
  type AlertRuleCreate,
  alertRule,
  organization,
  organizationMember,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, ne } from 'drizzle-orm'
import { deliverNotice } from '../integrations'
import type { DeliveryResult } from '../integrations/types'
import { isInstallationMember } from '../queries/github'
import type { AlertRuleRecord, EvaluableRule } from './types'

export const getAlertRulesForUser = async (userId: string): Promise<AlertRuleRecord[]> => {
  return await db
    .select({
      id: alertRule.id,
      installationId: alertRule.installationId,
      organization: organization.login,
      name: alertRule.name,
      kind: alertRule.kind,
      projectId: alertRule.projectId,
      threshold: alertRule.threshold,
      windowMinutes: alertRule.windowMinutes,
      state: alertRule.state,
      lastFiredAt: alertRule.lastFiredAt,
      lastEvaluatedAt: alertRule.lastEvaluatedAt,
      createdAt: alertRule.createdAt,
    })
    .from(alertRule)
    .innerJoin(organization, eq(organization.installationId, alertRule.installationId))
    .innerJoin(
      organizationMember,
      and(
        eq(organizationMember.installationId, alertRule.installationId),
        eq(organizationMember.userId, userId),
      ),
    )
    .orderBy(desc(alertRule.createdAt))
}

export const createAlertRule = async (
  userId: string,
  input: AlertRuleCreate,
): Promise<{ id: string } | null> => {
  if (!(await isInstallationMember(userId, input.installationId))) return null
  const [row] = await db
    .insert(alertRule)
    .values({ ...input, createdBy: userId })
    .returning({ id: alertRule.id })
  return row ?? null
}

async function ownedRule(userId: string, id: string) {
  const [row] = await db.select().from(alertRule).where(eq(alertRule.id, id)).limit(1)
  if (!row || !(await isInstallationMember(userId, row.installationId))) return null
  return row
}

export const setAlertRuleMuted = async (
  userId: string,
  id: string,
  isMuted: boolean,
): Promise<boolean> => {
  if (!(await ownedRule(userId, id))) return false
  await db
    .update(alertRule)
    .set({ state: isMuted ? 'muted' : 'armed' })
    .where(eq(alertRule.id, id))
  return true
}

export const deleteAlertRule = async (userId: string, id: string): Promise<boolean> => {
  if (!(await ownedRule(userId, id))) return false
  await db.delete(alertRule).where(eq(alertRule.id, id))
  return true
}

/** What whiskers evaluates: every rule that is not muted, and nothing about where it goes. */
export const getEvaluableRules = async (): Promise<EvaluableRule[]> => {
  return await db
    .select({
      id: alertRule.id,
      name: alertRule.name,
      kind: alertRule.kind,
      projectId: alertRule.projectId,
      threshold: alertRule.threshold,
      windowMinutes: alertRule.windowMinutes,
      state: alertRule.state,
      lastFiredAt: alertRule.lastFiredAt,
    })
    .from(alertRule)
    .where(ne(alertRule.state, 'muted'))
}

export const fireAlertRule = async (
  id: string,
  alert: AlertFire,
): Promise<DeliveryResult | null> => {
  const [rule] = await db.select().from(alertRule).where(eq(alertRule.id, id)).limit(1)
  if (!rule || rule.state === 'muted') return null
  await db
    .update(alertRule)
    .set({ state: 'firing', lastFiredAt: new Date(), lastEvaluatedAt: new Date() })
    .where(eq(alertRule.id, id))
  return deliverNotice([rule.installationId], alert)
}

export const quietAlertRule = async (id: string): Promise<void> => {
  await db
    .update(alertRule)
    .set({ state: 'armed', lastEvaluatedAt: new Date() })
    .where(and(eq(alertRule.id, id), eq(alertRule.state, 'firing')))
}
