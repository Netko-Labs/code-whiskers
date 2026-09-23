import { triageState } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'

export type TriageInput = typeof triageState.$inferInsert

/**
 * One row per (scope, kind, ref) — the latest decision wins. The assignee is only touched when
 * the caller says so: resolving an item must not quietly unassign it.
 */
export const setTriageState = async (input: TriageInput): Promise<void> => {
  await db
    .insert(triageState)
    .values(input)
    .onConflictDoUpdate({
      target: [triageState.scope, triageState.itemKind, triageState.itemRef],
      set: {
        status: input.status,
        snoozedUntil: input.snoozedUntil ?? null,
        note: input.note ?? null,
        updatedBy: input.updatedBy ?? null,
        updatedAt: new Date(),
        ...(input.assigneeUserId !== undefined && { assigneeUserId: input.assigneeUserId }),
      },
    })
}
