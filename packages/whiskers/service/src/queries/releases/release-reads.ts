import { db } from '@code-whiskers/whiskers-repository'
import { type SQL, sql } from 'drizzle-orm'
import { pairKey, type ReleaseCurrentKey } from '../../releases'
import { asDate } from '../insights/utils'
import { TREND_DAYS } from '../tracker/constants'
import { denseSeries, trendStartOf } from '../tracker/utils'
import type { DeploySummary, NewIssueCount, ReleaseEventStats, ReleaseKey } from './types'

type Row = Record<string, unknown>

/** `(project_id, release) in (…)` over `alias`; keys are bound, never spliced. */
function inKeys(alias: string, keys: ReleaseKey[]): SQL {
  return sql`(${sql.raw(`${alias}.project_id`)}, ${sql.raw(`${alias}.release`)}) in (${sql.join(
    keys.map((key) => sql`(${key.projectId}, ${key.version})`),
    sql`, `,
  )})`
}

const inList = (values: string[]): SQL =>
  sql.join(
    values.map((value) => sql`${value}`),
    sql`, `,
  )

export async function eventStatsOf(keys: ReleaseKey[]): Promise<Map<string, ReleaseEventStats>> {
  if (keys.length === 0) return new Map()
  const rows = (await db.execute(sql`
    select e.project_id, e.release, count(*)::int as events,
      count(distinct e.issue_id)::int as issues, count(distinct e.user_key)::int as users,
      coalesce(array_agg(distinct e.environment) filter (where e.environment is not null), '{}')
        as environments,
      mode() within group (order by e.environment) as environment
    from event e where ${inKeys('e', keys)}
    group by e.project_id, e.release`)) as Row[]
  return new Map(
    rows.map((row) => [
      pairKey(String(row.project_id), String(row.release)),
      {
        events: Number(row.events),
        issues: Number(row.issues),
        users: Number(row.users),
        environments: Array.isArray(row.environments) ? row.environments.map(String) : [],
        environment: row.environment ? String(row.environment) : null,
      },
    ]),
  )
}

/** Daily events over the trend window per release, oldest first. */
export async function trendsOf(keys: ReleaseKey[], now: Date): Promise<Map<string, number[]>> {
  if (keys.length === 0) return new Map()
  const start = trendStartOf(now).toISOString()
  const rows = (await db.execute(sql`
    select e.project_id, e.release, (date_trunc('day', e.received_at)::date - ${start}::date) as bucket,
      count(*)::int as n
    from event e where e.received_at >= ${start}::timestamp and ${inKeys('e', keys)}
    group by 1, 2, 3`)) as Row[]
  const grouped = new Map<string, { bucket: number; count: number }[]>()
  for (const row of rows) {
    const key = pairKey(String(row.project_id), String(row.release))
    grouped.set(key, [
      ...(grouped.get(key) ?? []),
      { bucket: Number(row.bucket), count: Number(row.n) },
    ])
  }
  return new Map(
    keys.map((key) => {
      const id = pairKey(key.projectId, key.version)
      return [id, denseSeries(TREND_DAYS, grouped.get(id) ?? [])]
    }),
  )
}

/** Issues counted in the release of their first event that carried one, as issue rows do. */
export async function newIssueCountsOf(
  projectIds: string[],
  versions: string[],
): Promise<Map<string, NewIssueCount>> {
  if (projectIds.length === 0 || versions.length === 0) return new Map()
  const rows = (await db.execute(sql`
    select i.project_id, fr.release, count(*)::int as total,
      (count(*) filter (where i.level in ('error', 'fatal')))::int as errors
    from issue i
    cross join lateral (
      select e.release from event e
      where e.issue_id = i.id and e.release is not null
      order by e.received_at asc limit 1
    ) fr
    where i.project_id in (${inList(projectIds)}) and fr.release in (${inList(versions)})
    group by i.project_id, fr.release`)) as Row[]
  return new Map(
    rows.map((row) => [
      pairKey(String(row.project_id), String(row.release)),
      { total: Number(row.total), errors: Number(row.errors) },
    ]),
  )
}

function toDeploy(row: Row): DeploySummary {
  return {
    id: String(row.id),
    releaseId: String(row.release_id),
    environment: String(row.environment),
    deployedAt: asDate(row.deployed_at),
    url: row.url ? String(row.url) : null,
    name: row.name ? String(row.name) : null,
  }
}

export async function deploysOf(releaseIds: string[]): Promise<DeploySummary[]> {
  if (releaseIds.length === 0) return []
  const rows = (await db.execute(sql`
    select id, release_id, environment, deployed_at, url, name from deploy
    where release_id in (${inList(releaseIds)})
    order by deployed_at desc`)) as Row[]
  return rows.map(toDeploy)
}

/** The newest deploy per project and environment: what each environment runs now. */
export async function deployedCurrentsOf(projectIds: string[]): Promise<ReleaseCurrentKey[]> {
  if (projectIds.length === 0) return []
  const rows = (await db.execute(sql`
    select distinct on (r.project_id, d.environment) r.project_id, d.environment, d.release_id
    from deploy d join release r on r.id = d.release_id
    where r.project_id in (${inList(projectIds)})
    order by r.project_id, d.environment, d.deployed_at desc`)) as Row[]
  return rows.map((row) => ({
    projectId: String(row.project_id),
    environment: String(row.environment),
    releaseId: String(row.release_id),
  }))
}

export async function commitCountsOf(releaseIds: string[]): Promise<Map<string, number>> {
  if (releaseIds.length === 0) return new Map()
  const rows = (await db.execute(sql`
    select release_id, count(*)::int as n from release_commit
    where release_id in (${inList(releaseIds)}) group by release_id`)) as Row[]
  return new Map(rows.map((row) => [String(row.release_id), Number(row.n)]))
}
