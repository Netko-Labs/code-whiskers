import { triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq, gt, inArray, isNull, or } from 'drizzle-orm'

export interface Suppression {
  itemKind: string
  itemRef: string
  status: string
  note: string | null
}

const SILENCING = ['dismissed', 'resolved', 'snoozed'] as const

/**
 * Decisions that should stop the reviewer raising something again on this repo.
 * A snooze that has expired is no longer silencing, so the finding comes back.
 */
export const getSuppressions = async (scope: string): Promise<Suppression[]> => {
  return await db
    .select({
      itemKind: triageState.itemKind,
      itemRef: triageState.itemRef,
      status: triageState.status,
      note: triageState.note,
    })
    .from(triageState)
    .where(
      and(
        eq(triageState.scope, scope),
        inArray(triageState.status, [...SILENCING]),
        or(isNull(triageState.snoozedUntil), gt(triageState.snoozedUntil, new Date())),
      ),
    )
    .limit(200)
}
