import {
  type IntegrationCreate,
  integration,
  organization,
  organizationMember,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { isInstallationMember } from '../queries/github'
import { decrypt, encrypt } from '../shared'
import { postNotice } from './deliver'
import type { DeliveryResult, IntegrationRecord, Notice } from './types'

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
  await db.delete(integration).where(eq(integration.id, id))
  return true
}

async function deliverTo(
  rows: (typeof integration.$inferSelect)[],
  notice: Notice,
): Promise<DeliveryResult> {
  const outcomes = await Promise.all(
    rows.map(async (row) => {
      try {
        await postNotice(row.kind, decrypt(row.urlEncrypted), notice)
        await db
          .update(integration)
          .set({ lastDeliveredAt: new Date(), lastError: null })
          .where(eq(integration.id, row.id))
        return true
      } catch (error) {
        await db
          .update(integration)
          .set({ lastError: error instanceof Error ? error.message : String(error) })
          .where(eq(integration.id, row.id))
        return false
      }
    }),
  )
  const delivered = outcomes.filter(Boolean).length
  return { delivered, failed: outcomes.length - delivered }
}

export const testIntegration = async (
  userId: string,
  id: string,
): Promise<DeliveryResult | null> => {
  const row = await editable(userId, id)
  if (!row) return null
  return deliverTo([row], {
    title: 'CodeWhiskers test',
    text: `This channel will receive alerts for ${row.name}.`,
  })
}

/** Alerts fan out to every integration on the installations named; secrets never leave studio. */
export const deliverNotice = async (
  installationIds: number[],
  notice: Notice,
): Promise<DeliveryResult> => {
  if (installationIds.length === 0) return { delivered: 0, failed: 0 }
  const rows = await db
    .select()
    .from(integration)
    .where(inArray(integration.installationId, installationIds))
  return deliverTo(rows, notice)
}
