import { MAX_BULK_TRIAGE, triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, asc, eq, isNull } from 'drizzle-orm'
import { PROJECT_SCOPE_PREFIX } from '../../queries/triage'
import { mirrorIssueLifecycle } from '../../whiskers'
import { MIRROR_SWEEP_BATCH, UUID_PATTERN } from './constants'
import { markMirrored } from './mark-mirrored'
import type { MirrorGroup, MirrorRow } from './types'
import { chunks, lifecycleOf } from './utils'

/**
 * Pushes issue decisions whiskers has not taken yet: write-throughs that failed, and every
 * decision made before whiskers kept a mirror. Each push is bound to the row's project, and
 * whiskers ignores ids outside it. Rows with nothing to push are marked done.
 * Returns how many decisions were settled.
 */
export const reconcileIssueMirror = async (): Promise<number> => {
  const startedAt = new Date()
  const rows: MirrorRow[] = await db
    .select({
      id: triageState.id,
      scope: triageState.scope,
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

  const groups = new Map<string, MirrorGroup>()
  const nothingToPush: string[] = []
  for (const row of rows) {
    const projectId = row.scope.startsWith(PROJECT_SCOPE_PREFIX)
      ? row.scope.slice(PROJECT_SCOPE_PREFIX.length)
      : ''
    const lifecycle = projectId && UUID_PATTERN.test(row.itemRef) ? lifecycleOf(row) : null
    if (!lifecycle) {
      nothingToPush.push(row.id)
      continue
    }
    const key = JSON.stringify({ projectId, lifecycle })
    const group = groups.get(key) ?? { projectId, lifecycle, rows: [] }
    group.rows.push(row)
    groups.set(key, group)
  }

  let settled = nothingToPush.length
  await markMirrored(nothingToPush, startedAt)
  for (const { projectId, lifecycle, rows: grouped } of groups.values()) {
    for (const batch of chunks(grouped, MAX_BULK_TRIAGE)) {
      const issues = await mirrorIssueLifecycle({
        ...lifecycle,
        projectId,
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
