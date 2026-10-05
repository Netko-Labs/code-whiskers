import { MAX_BULK_TRIAGE, triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, asc, eq, isNull } from 'drizzle-orm'
import { mirrorIssueLifecycle } from '../../whiskers'
import { MIRROR_SWEEP_BATCH, UUID_PATTERN } from './constants'
import { markMirrored } from './mark-mirrored'
import type { LifecycleDecision, MirrorRow } from './types'
import { chunks, lifecycleOf } from './utils'

/**
 * Pushes issue decisions whiskers has not taken yet: write-throughs that failed, and every
 * decision made before whiskers kept a mirror. Rows with nothing to push are marked done.
 * Returns how many decisions were settled.
 */
export const reconcileIssueMirror = async (): Promise<number> => {
  const startedAt = new Date()
  const rows: MirrorRow[] = await db
    .select({
      id: triageState.id,
      itemRef: triageState.itemRef,
      status: triageState.status,
      resolveMode: triageState.resolveMode,
      archiveMode: triageState.archiveMode,
      archiveValue: triageState.archiveValue,
      snoozedUntil: triageState.snoozedUntil,
    })
    .from(triageState)
    .where(and(eq(triageState.itemKind, 'issue'), isNull(triageState.mirroredAt)))
    .orderBy(asc(triageState.updatedAt))
    .limit(MIRROR_SWEEP_BATCH)

  const groups = new Map<string, { lifecycle: LifecycleDecision; rows: MirrorRow[] }>()
  const nothingToPush: string[] = []
  for (const row of rows) {
    const lifecycle = UUID_PATTERN.test(row.itemRef) ? lifecycleOf(row) : null
    if (!lifecycle) {
      nothingToPush.push(row.id)
      continue
    }
    const key = JSON.stringify(lifecycle)
    const group = groups.get(key) ?? { lifecycle, rows: [] }
    group.rows.push(row)
    groups.set(key, group)
  }

  let settled = nothingToPush.length
  await markMirrored(nothingToPush, startedAt)
  for (const { lifecycle, rows: grouped } of groups.values()) {
    for (const batch of chunks(grouped, MAX_BULK_TRIAGE)) {
      const issues = await mirrorIssueLifecycle({
        ...lifecycle,
        issueIds: batch.map((row) => row.itemRef),
      })
      if (!issues) return settled
      await markMirrored(
        batch.map((row) => row.id),
        startedAt,
      )
      settled += batch.length
    }
  }
  return settled
}
