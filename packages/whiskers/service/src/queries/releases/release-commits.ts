import { type ReleaseCommit, releaseCommitTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { desc, eq, sql } from 'drizzle-orm'
import { EVENT_PAYLOAD } from '../tracker/constants'
import { normalizeEvent } from '../tracker/normalize-event'
import { SUSPECT_EVENT_SAMPLE } from './constants'
import type { ReviewVerdict } from './types'

type Row = Record<string, unknown>

export async function commitsOf(releaseId: string): Promise<Omit<ReleaseCommit, 'releaseId'>[]> {
  const rows = await db
    .select()
    .from(releaseCommitTable)
    .where(eq(releaseCommitTable.releaseId, releaseId))
    .orderBy(desc(releaseCommitTable.committedAt))
  return rows.map(({ releaseId: _, ...commit }) => commit)
}

/** The newest review whiskers ran on each pull request, keyed by its number. */
export async function reviewVerdictsOf(
  repository: string | null,
  prNumbers: number[],
): Promise<Map<number, ReviewVerdict>> {
  const [owner, repo] = repository?.split('/') ?? []
  if (!owner || !repo || prNumbers.length === 0) return new Map()
  const rows = (await db.execute(sql`
    select distinct on (pr_number) pr_number, id, status, verdict from review
    where lower(owner) = ${owner.toLowerCase()} and lower(repo) = ${repo.toLowerCase()}
      and pr_number in (${sql.join(
        [...new Set(prNumbers)].map((n) => sql`${n}`),
        sql`, `,
      )})
    order by pr_number, created_at desc`)) as Row[]
  return new Map(
    rows.map((row) => [
      Number(row.pr_number),
      {
        id: String(row.id),
        status: String(row.status),
        verdict: row.verdict ? String(row.verdict) : null,
      },
    ]),
  )
}

function payloadOf(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/** In-app frame paths from each issue's newest events: where its stack actually runs. */
export async function inAppFramesOf(issueIds: string[]): Promise<Map<string, string[]>> {
  if (issueIds.length === 0) return new Map()
  const rows = (await db.execute(sql`
    select issue_id, payload from (
      select issue_id, ${EVENT_PAYLOAD} as payload,
        row_number() over (partition by issue_id order by received_at desc) as n
      from event where issue_id in (${sql.join(
        issueIds.map((id) => sql`${id}::uuid`),
        sql`, `,
      )})
    ) sampled where n <= ${SUSPECT_EVENT_SAMPLE}`)) as Row[]
  const frames = new Map<string, Set<string>>()
  for (const row of rows) {
    const id = String(row.issue_id)
    const seen = frames.get(id) ?? new Set<string>()
    for (const frame of normalizeEvent(payloadOf(row.payload)).frames) {
      if (frame.isInApp && frame.file !== '<unknown>') seen.add(frame.file)
    }
    frames.set(id, seen)
  }
  return new Map([...frames].map(([id, files]) => [id, [...files]]))
}
