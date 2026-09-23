import { db } from '@code-whiskers/studio-repository'
import { sql } from 'drizzle-orm'
import { STUDIO_STORES } from './constants'
import type { StudioStorage, StudioStore } from './types'

type Row = Record<string, unknown>

function first(result: unknown): Row {
  return ((result as Row[])[0] ?? {}) as Row
}

/** Studio's tables are human-sized — exact counts are cheap here, unlike whiskers' telemetry. */
async function storeOf(table: string, oldestColumn: string): Promise<StudioStore> {
  const row = first(
    await db.execute(sql`
      select pg_total_relation_size(${table}::regclass) as bytes,
             count(*)::bigint as rows,
             min(${sql.identifier(oldestColumn)}) as oldest
      from ${sql.identifier(table)}`),
  )
  return {
    table,
    bytes: Number(row.bytes ?? 0),
    rows: Number(row.rows ?? 0),
    oldest: row.oldest ? new Date(String(row.oldest)) : null,
  }
}

export const getStudioStorage = async (): Promise<StudioStorage> => {
  const [size, ...stores] = await Promise.all([
    db.execute(sql`select pg_database_size(current_database()) as bytes`),
    ...STUDIO_STORES.map((store) => storeOf(store.table, store.oldest)),
  ])
  return { databaseBytes: Number(first(size).bytes ?? 0), stores }
}
