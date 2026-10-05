import {
  MAX_PROJECT_KEYS,
  type ProjectKeyUpdate,
  projectKeyTable,
} from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { and, count, eq } from 'drizzle-orm'
import { keyDeletionOf, newPublicKey } from '../../tracker/keys'
import type { KeyRemoval } from './types'

/** Undefined when the project is past `MAX_PROJECT_KEYS`; the caller has checked it exists. */
export async function createProjectKey(projectId: string, label: string) {
  const [held] = await db
    .select({ value: count() })
    .from(projectKeyTable)
    .where(eq(projectKeyTable.projectId, projectId))
  if ((held?.value ?? 0) >= MAX_PROJECT_KEYS) return undefined
  const [key] = await db
    .insert(projectKeyTable)
    .values({ projectId, label, publicKey: newPublicKey() })
    .returning()
  return key
}

export const updateProjectKey = async (projectId: string, keyId: string, patch: ProjectKeyUpdate) =>
  (
    await db
      .update(projectKeyTable)
      .set(patch)
      .where(and(eq(projectKeyTable.projectId, projectId), eq(projectKeyTable.id, keyId)))
      .returning()
  )[0]

/** The project's keys are locked first, so two deletes cannot each leave the other last. */
export const deleteProjectKey = (projectId: string, keyId: string): Promise<KeyRemoval> =>
  db.transaction(async (tx) => {
    const keys = await tx
      .select()
      .from(projectKeyTable)
      .where(eq(projectKeyTable.projectId, projectId))
      .for('update')
    const verdict = keyDeletionOf(keys, keyId)
    if (verdict !== 'allowed') return verdict
    await tx.delete(projectKeyTable).where(eq(projectKeyTable.id, keyId))
    return 'deleted'
  })
