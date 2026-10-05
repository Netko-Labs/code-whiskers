import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'
import { EVENT_PAYLOAD, TAG_SAMPLE_EVENTS, TOP_TAG_KEYS, TOP_TAG_VALUES } from './constants'
import type { TagDistribution } from './types'

type Row = Record<string, unknown>

/**
 * Tag distributions over the issue's newest events. SDKs send tags as an object or as `[key,
 * value]` pairs; browser, OS and runtime names are read from contexts the way Sentry derives them.
 */
export const getIssueTags = async (issueId: string): Promise<TagDistribution[]> => {
  const rows = (await db.execute(sql`
    with recent as (
      select ${EVENT_PAYLOAD} as p from event
      where issue_id = ${issueId}
      order by received_at desc
      limit ${TAG_SAMPLE_EVENTS}
    ), pairs as (
      select kv.key, kv.value #>> '{}' as value
      from recent, jsonb_each(
        case when jsonb_typeof(p->'tags') = 'object' then p->'tags' else '{}'::jsonb end
      ) kv
      union all
      select pair->>0, pair->>1
      from recent, jsonb_array_elements(
        case when jsonb_typeof(p->'tags') = 'array' then p->'tags' else '[]'::jsonb end
      ) pair
      where jsonb_typeof(pair) = 'array'
      union all
      select 'browser', p->'contexts'->'browser'->>'name' from recent
      union all
      select 'os', p->'contexts'->'os'->>'name' from recent
      union all
      select 'runtime', p->'contexts'->'runtime'->>'name' from recent
    ), counted as (
      select key, value, count(*)::int as n from pairs
      where key is not null and value is not null and value <> ''
      group by key, value
    ), ranked as (
      select key, value, n,
        row_number() over (partition by key order by n desc, value) as value_rank,
        sum(n) over (partition by key) as key_total
      from counted
    ), top_keys as (
      select key from ranked group by key order by max(key_total) desc, key limit ${TOP_TAG_KEYS}
    )
    select r.key, r.value, r.n from ranked r join top_keys k on k.key = r.key
    where r.value_rank <= ${TOP_TAG_VALUES}
    order by r.key_total desc, r.key, r.n desc`)) as Row[]

  const byKey = new Map<string, TagDistribution>()
  for (const row of rows) {
    const key = String(row.key)
    const distribution = byKey.get(key) ?? { key, values: [] }
    distribution.values.push({ value: String(row.value), count: Number(row.n) })
    byKey.set(key, distribution)
  }
  return [...byKey.values()]
}
