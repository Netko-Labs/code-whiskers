import {
  type AlertDeliveryRecord,
  alertRule,
  type IntegrationCreate,
  integration,
  organization,
  organizationMember,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { isInstallationMember } from '../queries/github'
import { decrypt, encrypt } from '../shared'
import { assertPublicHost } from './address-guard'
import { postNotice } from './deliver'
import type { DeliveryResult, DeliveryTarget, IntegrationRecord, Notice } from './types'

const COLUMNS = {
  id: integration.id,
  installationId: integration.installationId,
  organization: organization.login,
  kind: integration.kind,
  name: integration.name,
  urlHost: integration.urlHost,
  lastDeliveredAt: integration.lastDeliveredAt,
  lastError: integration.lastError,
  createdAt: integration.createdAt,
}

export const getIntegrationsForUser = async (userId: string): Promise<IntegrationRecord[]> => {
  return await db
    .select(COLUMNS)
    .from(integration)
    .innerJoin(organization, eq(organization.installationId, integration.installationId))
    .innerJoin(
      organizationMember,
      and(
        eq(organizationMember.installationId, integration.installationId),
        eq(organizationMember.userId, userId),
      ),
    )
    .orderBy(desc(integration.createdAt))
}

export const createIntegration = async (
  userId: string,
  input: IntegrationCreate,
): Promise<{ id: string } | null> => {
  if (!(await isInstallationMember(userId, input.installationId))) return null
  await assertPublicHost(input.url)
  const [row] = await db
    .insert(integration)
    .values({
      installationId: input.installationId,
      kind: input.kind,
      name: input.name,
      urlEncrypted: encrypt(input.url),
      urlHost: new URL(input.url).host,
      createdBy: userId,
    })
    .returning({ id: integration.id })
  return row ?? null
}

async function editable(userId: string, id: string) {
  const [row] = await db.select().from(integration).where(eq(integration.id, id)).limit(1)
  if (!row || !(await isInstallationMember(userId, row.installationId))) return null
  return row
}

export const deleteIntegration = async (userId: string, id: string): Promise<boolean> => {
  if (!(await editable(userId, id))) return false
  await db.transaction(async (tx) => {
    await tx
      .update(alertRule)
      .set({ destinationIds: sql`array_remove(${alertRule.destinationIds}, ${id}::uuid)` })
      .where(sql`${id}::uuid = any(${alertRule.destinationIds})`)
    await tx.delete(integration).where(eq(integration.id, id))
  })
  return true
}

async function deliverOne(
  row: typeof integration.$inferSelect,
  notice: Notice,
): Promise<AlertDeliveryRecord> {
  const record = { integrationId: row.id, name: row.name, kind: row.kind }
  try {
    await postNotice(row.kind, decrypt(row.urlEncrypted), notice)
    await db
      .update(integration)
      .set({ lastDeliveredAt: new Date(), lastError: null })
      .where(eq(integration.id, row.id))
    return { ...record, isDelivered: true, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await db.update(integration).set({ lastError: message }).where(eq(integration.id, row.id))
    return { ...record, isDelivered: false, error: message }
  }
}

export const testIntegration = async (
  userId: string,
  id: string,
): Promise<DeliveryResult | null> => {
  const row = await editable(userId, id)
  if (!row) return null
  const outcome = await deliverOne(row, {
    title: 'CodeWhiskers test',
    text: `This channel will receive alerts for ${row.name}.`,
  })
  return outcome.isDelivered
    ? { delivered: 1, failed: 0, error: null }
    : { delivered: 0, failed: 1, error: outcome.error }
}

/** A rule delivers to the destinations it names, or every one on its installation. */
export const deliverToDestinations = async (
  installationId: number,
  target: DeliveryTarget,
  notice: Notice,
): Promise<AlertDeliveryRecord[]> => {
  if (!target.notifyAll && target.destinationIds.length === 0) return []
  const rows = await db
    .select()
    .from(integration)
    .where(
      and(
        eq(integration.installationId, installationId),
        target.notifyAll ? undefined : inArray(integration.id, target.destinationIds),
      ),
    )
  return Promise.all(rows.map((row) => deliverOne(row, notice)))
}

export const hasDestination = async (installationId: number): Promise<boolean> => {
  const [row] = await db
    .select({ id: integration.id })
    .from(integration)
    .where(eq(integration.installationId, installationId))
    .limit(1)
  return Boolean(row)
}
