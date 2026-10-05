import { studioEnvConfig } from '@code-whiskers/studio-config'
import { alertRule, type IssueTransitionBody, organization } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq, ne, sql } from 'drizzle-orm'
import { fireAlertRule } from './fire'
import { matchesIssueFilters } from './utils'

/** A regression alerts the moment ingest reports it, not on the next evaluation pass. */
export const alertOnIssueTransition = async (body: IssueTransitionBody): Promise<number> => {
  if (body.kind !== 'regressed') return 0
  const rules = await db
    .select({ rule: alertRule, login: organization.login })
    .from(alertRule)
    .innerJoin(organization, eq(organization.installationId, alertRule.installationId))
    .where(and(ne(alertRule.state, 'muted'), sql`'issue_regressed' = any(${alertRule.triggers})`))
  const signal = {
    projectId: body.projectId,
    repository: body.repository,
    environment: body.environment,
    release: body.release,
    level: body.level,
  }
  const matching = rules.filter(({ rule, login }) =>
    matchesIssueFilters({ ...rule, login }, signal),
  )
  const where = [body.release && `in ${body.release}`, body.environment].filter(Boolean)
  for (const { rule } of matching) {
    await fireAlertRule(rule.id, {
      title: `Regressed: ${body.title ?? `issue in project ${body.projectId}`}`.slice(0, 200),
      text: `Back after a resolve${where.length ? ` · ${where.join(' · ')}` : ''}.`,
      url: new URL(`/console/issues/${body.issueId}`, studioEnvConfig.app.baseUrl).toString(),
      trigger: 'issue_regressed',
      subject: { kind: 'issue', ref: body.issueId },
      projectId: body.projectId,
    })
  }
  return matching.length
}
