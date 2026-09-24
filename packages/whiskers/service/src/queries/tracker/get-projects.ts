import { eventTable, issueTable, projectTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { asc, count, eq, max } from 'drizzle-orm'

export interface ProjectSummary {
  id: string
  name: string
  publicKey: string
  createdAt: Date
  issues: number
  lastEventAt: Date | null
}

/** Projects with how much they have sent — the DSN is only useful next to proof it works. */
export const getProjects = async (): Promise<ProjectSummary[]> => {
  const [projects, issues, events] = await Promise.all([
    db.select().from(projectTable).orderBy(asc(projectTable.createdAt)),
    db
      .select({ projectId: issueTable.projectId, value: count() })
      .from(issueTable)
      .groupBy(issueTable.projectId),
    db
      .select({ projectId: eventTable.projectId, value: max(eventTable.receivedAt) })
      .from(eventTable)
      .groupBy(eventTable.projectId),
  ])
  const issuesBy = new Map(issues.map((r) => [r.projectId, r.value]))
  const lastBy = new Map(events.map((r) => [r.projectId, r.value]))
  return projects.map((project) => ({
    ...project,
    issues: issuesBy.get(project.id) ?? 0,
    lastEventAt: lastBy.get(project.id) ?? null,
  }))
}

export const getProjectById = async (id: string) =>
  (await db.select().from(projectTable).where(eq(projectTable.id, id)).limit(1))[0]
