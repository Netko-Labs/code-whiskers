import { eventTable, issueTable, projectTable, reviewTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, eq, exists, inArray, isNull, or, type SQL, sql } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import type { AlertCondition } from './types'
import { levelsAtLeast } from './utils'

/**
 * The named projects, or else every project the installation owns: linked to one of its
 * repositories, or linked to none (an unlinked project is instance-wide).
 */
export function projectScope(condition: AlertCondition, column: AnyPgColumn): SQL {
  if (condition.projectIds.length > 0) return inArray(column, condition.projectIds)
  const owned = db
    .select({ id: projectTable.id })
    .from(projectTable)
    .where(
      or(
        isNull(projectTable.repository),
        eq(sql`lower(split_part(${projectTable.repository}, '/', 1))`, condition.owner),
      ),
    )
  return inArray(column, owned)
}

export function eventFilters(condition: AlertCondition): SQL[] {
  const levels = levelsAtLeast(condition.minLevel)
  return [
    projectScope(condition, eventTable.projectId),
    ...(condition.environment ? [eq(eventTable.environment, condition.environment)] : []),
    ...(condition.release ? [eq(eventTable.release, condition.release)] : []),
    ...(levels ? [inArray(eventTable.level, levels)] : []),
  ]
}

/** Environment and release live on events: an issue matches when one of its events does. */
export function issueFilters(condition: AlertCondition): SQL[] {
  const levels = levelsAtLeast(condition.minLevel)
  const eventMatch = [
    ...(condition.environment ? [eq(eventTable.environment, condition.environment)] : []),
    ...(condition.release ? [eq(eventTable.release, condition.release)] : []),
  ]
  return [
    projectScope(condition, issueTable.projectId),
    ...(levels ? [inArray(issueTable.level, levels)] : []),
    ...(eventMatch.length > 0
      ? [
          exists(
            db
              .select({ one: sql`1` })
              .from(eventTable)
              .where(and(eq(eventTable.issueId, issueTable.id), ...eventMatch)),
          ),
        ]
      : []),
  ]
}

/** Reviews belong to the installation's account; a project filter narrows to its repositories. */
export function reviewFilters(condition: AlertCondition): SQL[] {
  const owner = eq(sql`lower(${reviewTable.owner})`, condition.owner)
  if (condition.projectIds.length === 0) return [owner]
  const repositories = db
    .select({ slug: sql`lower(${projectTable.repository})` })
    .from(projectTable)
    .where(inArray(projectTable.id, condition.projectIds))
  return [
    owner,
    inArray(sql`lower(${reviewTable.owner} || '/' || ${reviewTable.repo})`, repositories),
  ]
}
