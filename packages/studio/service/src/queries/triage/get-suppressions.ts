import { triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, gt, inArray, isNull, or } from 'drizzle-orm'
import type { SuppressionPage } from './types'

const SILENCING = ['dismissed', 'resolved', 'snoozed'] as const

export const SUPPRESSION_LIMIT = 200

/**
 * Decisions that should stop the reviewer raising something again on this repo,
 * newest first so a cap drops the stalest. An expired snooze no longer silences.
 */
export const getSuppressions = async (scope: string): Promise<SuppressionPage> => {
  const rows = await db
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
    .orderBy(desc(triageState.updatedAt))
    .limit(SUPPRESSION_LIMIT + 1)
  return {
    suppressions: rows.slice(0, SUPPRESSION_LIMIT),
    isTruncated: rows.length > SUPPRESSION_LIMIT,
  }
}
