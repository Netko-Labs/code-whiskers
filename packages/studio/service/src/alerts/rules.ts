import {
  type AlertRuleCreate,
  type AlertRuleUpdate,
  alertRule,
  integration,
  organization,
  organizationMember,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { isInstallationMember } from '../queries/github'
import type { AlertRuleRecord } from './types'

const RULE_COLUMNS = {
  id: alertRule.id,
  installationId: alertRule.installationId,
  organization: organization.login,
  name: alertRule.name,
  triggers: alertRule.triggers,
  projectIds: alertRule.projectIds,
  environment: alertRule.environment,
  minLevel: alertRule.minLevel,
  release: alertRule.release,
  threshold: alertRule.threshold,
  windowMinutes: alertRule.windowMinutes,
  notifyAll: alertRule.notifyAll,
  destinationIds: alertRule.destinationIds,
  actionIntervalMinutes: alertRule.actionIntervalMinutes,
  defaultFor: alertRule.defaultFor,
  state: alertRule.state,
  lastFiredAt: alertRule.lastFiredAt,
  lastEvaluatedAt: alertRule.lastEvaluatedAt,
  createdAt: alertRule.createdAt,
  updatedAt: alertRule.updatedAt,
}

function rulesForUser(userId: string) {
  return db
    .select(RULE_COLUMNS)
    .from(alertRule)
    .innerJoin(organization, eq(organization.installationId, alertRule.installationId))
    .innerJoin(
      organizationMember,
      and(
        eq(organizationMember.installationId, alertRule.installationId),
        eq(organizationMember.userId, userId),
      ),
    )
    .$dynamic()
}

export const getAlertRulesForUser = async (userId: string): Promise<AlertRuleRecord[]> => {
  return await rulesForUser(userId).orderBy(desc(alertRule.createdAt))
}

export const getAlertRuleForUser = async (
  userId: string,
  id: string,
): Promise<AlertRuleRecord | null> => {
  const [row] = await rulesForUser(userId).where(eq(alertRule.id, id)).limit(1)
  return row ?? null
}

/** Only destinations on the rule's own installation; a stale or foreign id is dropped. */
async function ownDestinations(installationId: number, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return []
  const rows = await db
    .select({ id: integration.id })
    .from(integration)
    .where(and(eq(integration.installationId, installationId), inArray(integration.id, ids)))
  const known = new Set(rows.map((row) => row.id))
  return ids.filter((id) => known.has(id))
}

export const createAlertRule = async (
  userId: string,
  input: AlertRuleCreate,
): Promise<{ id: string } | null> => {
  if (!(await isInstallationMember(userId, input.installationId))) return null
  const [row] = await db
    .insert(alertRule)
    .values({
      ...input,
      destinationIds: await ownDestinations(input.installationId, input.destinationIds),
      createdBy: userId,
    })
    .returning({ id: alertRule.id })
  return row ?? null
}

async function ownedRule(userId: string, id: string) {
  const [row] = await db.select().from(alertRule).where(eq(alertRule.id, id)).limit(1)
  if (!row || !(await isInstallationMember(userId, row.installationId))) return null
  return row
}

/** `isMuted` alone is the list toggle; any other field is an edit and re-arms a firing rule. */
export const updateAlertRule = async (
  userId: string,
  id: string,
  patch: AlertRuleUpdate,
): Promise<boolean> => {
  const rule = await ownedRule(userId, id)
  if (!rule) return false
  const { isMuted, destinationIds, ...fields } = patch
  const isEdit = Object.keys(fields).length > 0 || destinationIds !== undefined
  const state =
    isMuted === true
      ? 'muted'
      : isMuted === false || (isEdit && rule.state === 'firing')
        ? 'armed'
        : undefined
  await db
    .update(alertRule)
    .set({
      ...fields,
      ...(destinationIds && {
        destinationIds: await ownDestinations(rule.installationId, destinationIds),
      }),
      ...(state && { state }),
      updatedAt: new Date(),
    })
    .where(eq(alertRule.id, id))
  return true
}

export const deleteAlertRule = async (userId: string, id: string): Promise<boolean> => {
  if (!(await ownedRule(userId, id))) return false
  await db.delete(alertRule).where(eq(alertRule.id, id))
  return true
}
