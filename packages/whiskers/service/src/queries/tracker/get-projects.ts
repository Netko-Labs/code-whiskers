import {
  eventTable,
  issueTable,
  projectKeyTable,
  projectTable,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { asc, count, eq, max } from 'drizzle-orm'
import type { ProjectSummary } from './types'

const PROJECT_COLUMNS = {
  id: projectTable.id,
  name: projectTable.name,
  repository: projectTable.repository,
  createdAt: projectTable.createdAt,
}

/** Projects with their keys and how much they have sent: a DSN is only useful next to proof. */
async function summaries(projectId?: string): Promise<ProjectSummary[]> {
  const [projects, keys, issues, events] = await Promise.all([
    db
      .select(PROJECT_COLUMNS)
      .from(projectTable)
      .where(projectId ? eq(projectTable.id, projectId) : undefined)
      .orderBy(asc(projectTable.createdAt)),
    db
      .select()
      .from(projectKeyTable)
      .where(projectId ? eq(projectKeyTable.projectId, projectId) : undefined)
      .orderBy(asc(projectKeyTable.createdAt)),
    db
      .select({ projectId: issueTable.projectId, value: count() })
      .from(issueTable)
      .where(projectId ? eq(issueTable.projectId, projectId) : undefined)
      .groupBy(issueTable.projectId),
    db
      .select({ projectId: eventTable.projectId, value: max(eventTable.receivedAt) })
      .from(eventTable)
      .where(projectId ? eq(eventTable.projectId, projectId) : undefined)
      .groupBy(eventTable.projectId),
  ])
  const issuesBy = new Map(issues.map((r) => [r.projectId, r.value]))
  const lastBy = new Map(events.map((r) => [r.projectId, r.value]))
  return projects.map((project) => ({
    ...project,
    keys: keys.filter((key) => key.projectId === project.id),
    issues: issuesBy.get(project.id) ?? 0,
    lastEventAt: lastBy.get(project.id) ?? null,
  }))
}

export const getProjects = (): Promise<ProjectSummary[]> => summaries()

export const getProjectSummary = async (id: string): Promise<ProjectSummary | undefined> =>
  (await summaries(id))[0]

export const getProjectKeys = (projectId: string) =>
  db
    .select()
    .from(projectKeyTable)
    .where(eq(projectKeyTable.projectId, projectId))
    .orderBy(asc(projectKeyTable.createdAt))
