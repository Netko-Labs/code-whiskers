import {
  ALERT_RATE_TRIGGERS,
  type AlertFire,
  type AlertTrigger,
  alertFiring,
  alertRule,
  FIRING_RETENTION_DAYS,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq, gt, lt, or, sql } from 'drizzle-orm'
import { deliverToDestinations } from '../integrations'
import { realtimeBus } from '../realtime'
import type { FireOutcome } from './types'
import { firingStatusOf, isOncePerSubject } from './utils'

const RATE_TRIGGERS: readonly string[] = ALERT_RATE_TRIGGERS
const DAY_MS = 86_400_000

/**
 * At most once per subject per action interval, across the rule's triggers; a new issue or a
 * review is news exactly once.
 */
async function isThrottled(
  rule: typeof alertRule.$inferSelect,
  alert: AlertFire,
  now: Date,
): Promise<boolean> {
  if (!alert.subject) return false
  const since = new Date(now.getTime() - rule.actionIntervalMinutes * 60_000)
  const trigger: AlertTrigger | undefined = alert.trigger
  const [hit] = await db
    .select({ id: alertFiring.id })
    .from(alertFiring)
    .where(
      and(
        eq(alertFiring.ruleId, rule.id),
        eq(alertFiring.subjectKind, alert.subject.kind),
        eq(alertFiring.subjectRef, alert.subject.ref),
        or(
          gt(alertFiring.createdAt, since),
          trigger && isOncePerSubject(trigger) ? eq(alertFiring.trigger, trigger) : sql`false`,
        ),
      ),
    )
    .limit(1)
  return Boolean(hit)
}

export const fireAlertRule = async (
  id: string,
  alert: AlertFire,
  now = new Date(),
): Promise<FireOutcome | null> => {
  const [rule] = await db.select().from(alertRule).where(eq(alertRule.id, id)).limit(1)
  if (!rule || rule.state === 'muted') return null
  if (await isThrottled(rule, alert, now)) return { delivered: 0, failed: 0, isThrottled: true }

  const deliveries = await deliverToDestinations(rule.installationId, rule, {
    title: alert.title,
    text: alert.text,
    url: alert.url,
  })
  const isRate = alert.trigger ? RATE_TRIGGERS.includes(alert.trigger) : true
  await db.transaction(async (tx) => {
    await tx.insert(alertFiring).values({
      ruleId: rule.id,
      installationId: rule.installationId,
      trigger: alert.trigger ?? null,
      subjectKind: alert.subject?.kind ?? null,
      subjectRef: alert.subject?.ref ?? null,
      projectId: alert.projectId ?? null,
      title: alert.title,
      text: alert.text,
      url: alert.url ?? null,
      status: firingStatusOf(deliveries),
      deliveries,
      createdAt: now,
    })
    await tx
      .update(alertRule)
      .set({ lastFiredAt: now, ...(isRate && { state: 'firing' as const }) })
      .where(eq(alertRule.id, rule.id))
    await tx
      .delete(alertFiring)
      .where(
        and(
          eq(alertFiring.ruleId, rule.id),
          lt(alertFiring.createdAt, new Date(now.getTime() - FIRING_RETENTION_DAYS * DAY_MS)),
        ),
      )
  })
  realtimeBus.publish(['alerts'])

  const delivered = deliveries.filter((delivery) => delivery.isDelivered).length
  return { delivered, failed: deliveries.length - delivered, isThrottled: false }
}
