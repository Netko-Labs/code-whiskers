import {
  alertRule,
  DEFAULT_ACTION_INTERVAL,
  DEFAULT_RULE_ENVIRONMENT,
  organization,
  type ProjectCreatedBody,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq, sql } from 'drizzle-orm'
import { hasDestination } from '../integrations'
import { repositoryOwner } from './utils'

/**
 * Every new project gets "new or regressed issue in production → all destinations, once per issue
 * per 30 min" on the installation that owns its repository (every installation when unlinked).
 * Without a destination it starts muted; the first destination arms it.
 */
export const createDefaultRules = async (body: ProjectCreatedBody): Promise<number> => {
  const owner = repositoryOwner(body.repository)
  const installations = await db
    .select({ installationId: organization.installationId })
    .from(organization)
    .where(owner ? eq(sql`lower(${organization.login})`, owner) : undefined)
  let created = 0
  for (const { installationId } of installations) {
    const rows = await db
      .insert(alertRule)
      .values({
        installationId,
        name: `${body.name}: new or regressed in ${DEFAULT_RULE_ENVIRONMENT}`.slice(0, 80),
        triggers: ['new_issue', 'issue_regressed'],
        projectIds: [body.projectId],
        environment: DEFAULT_RULE_ENVIRONMENT,
        notifyAll: true,
        actionIntervalMinutes: DEFAULT_ACTION_INTERVAL,
        defaultFor: body.projectId,
        state: (await hasDestination(installationId)) ? 'armed' : 'muted',
      })
      .onConflictDoNothing({ target: [alertRule.installationId, alertRule.defaultFor] })
      .returning({ id: alertRule.id })
    created += rows.length
  }
  return created
}

/**
 * Rules saved muted for want of a destination arm with the first one. A rule a human muted or
 * edited since (`updated_at` moved) stays as it is.
 */
export const armRulesAwaitingDestination = async (installationId: number): Promise<void> => {
  await db
    .update(alertRule)
    .set({ state: 'armed' })
    .where(
      and(
        eq(alertRule.installationId, installationId),
        eq(alertRule.state, 'muted'),
        eq(alertRule.updatedAt, alertRule.createdAt),
      ),
    )
}
