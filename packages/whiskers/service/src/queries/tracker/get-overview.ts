import { eventTable, issueTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { count } from 'drizzle-orm'

export const getOverview = async (): Promise<{
  summary: { events: number; issues: number }
}> => {
  const [events, issues] = await Promise.all([
    db.select({ value: count() }).from(eventTable),
    db.select({ value: count() }).from(issueTable),
  ])
  return { summary: { events: events[0]?.value ?? 0, issues: issues[0]?.value ?? 0 } }
}
