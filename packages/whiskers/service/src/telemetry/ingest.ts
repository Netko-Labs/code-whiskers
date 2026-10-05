import { whiskersEnvConfig } from '@code-whiskers/whiskers-config'
import {
  eventTable,
  logLineTable,
  type Project,
  projectKeyTable,
  projectTable,
  spanTable,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, eq, lt } from 'drizzle-orm'
import { announce } from '../realtime'
import { touchKey } from '../tracker/key-usage'
import { INSERT_BATCH } from './constants'
import type { LogLineInput, SpanInput } from './types'

export const enabledKeyLookup = (key: string) =>
  db
    .select({ project: projectTable, keyId: projectKeyTable.id })
    .from(projectKeyTable)
    .innerJoin(projectTable, eq(projectTable.id, projectKeyTable.projectId))
    .where(and(eq(projectKeyTable.publicKey, key), eq(projectKeyTable.isEnabled, true)))
    .limit(1)

/** OTLP exporters send a header, not a DSN: one of the project's enabled keys identifies it. */
export async function projectForKey(key: string | undefined): Promise<Project | undefined> {
  if (!key) return undefined
  const [row] = await enabledKeyLookup(key)
  if (!row) return undefined
  touchKey(row.keyId)
  return row.project
}

async function insertInBatches<T>(
  rows: T[],
  insert: (batch: T[]) => Promise<unknown>,
): Promise<void> {
  for (let index = 0; index < rows.length; index += INSERT_BATCH) {
    await insert(rows.slice(index, index + INSERT_BATCH))
  }
}

export async function ingestLogs(projectId: string, rows: LogLineInput[]): Promise<number> {
  await insertInBatches(rows, (batch) =>
    db.insert(logLineTable).values(batch.map((row) => ({ ...row, projectId }))),
  )
  announce('logs')
  return rows.length
}

export async function ingestSpans(projectId: string, rows: SpanInput[]): Promise<number> {
  await insertInBatches(rows, (batch) =>
    db.insert(spanTable).values(batch.map((row) => ({ ...row, projectId }))),
  )
  announce('traces')
  return rows.length
}

const DAY_MS = 86_400_000

/**
 * Raw telemetry is kept for the configured number of days, then deleted by time. Error events
 * get a longer window of their own; their issue keeps its count and first/last seen.
 */
export async function expireTelemetry(
  now = new Date(),
): Promise<{ logs: number; spans: number; events: number }> {
  const { retentionDays, errorEventRetentionDays } = whiskersEnvConfig.telemetry
  const cutoff = new Date(now.getTime() - retentionDays * DAY_MS)
  const eventCutoff = new Date(now.getTime() - errorEventRetentionDays * DAY_MS)
  const [logs, spans, events] = await Promise.all([
    db
      .delete(logLineTable)
      .where(lt(logLineTable.timestamp, cutoff))
      .returning({ id: logLineTable.id }),
    db.delete(spanTable).where(lt(spanTable.startTime, cutoff)).returning({ id: spanTable.id }),
    db
      .delete(eventTable)
      .where(lt(eventTable.receivedAt, eventCutoff))
      .returning({ id: eventTable.id }),
  ])
  return { logs: logs.length, spans: spans.length, events: events.length }
}
