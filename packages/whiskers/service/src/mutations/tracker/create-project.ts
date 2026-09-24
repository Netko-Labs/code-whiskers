import { randomBytes } from 'node:crypto'
import { projectTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'

/**
 * Sentry SDKs parse the DSN path as a numeric project id, so the id is the next integer rather
 * than a uuid. The public key is what SDKs send as `sentry_key`.
 */
export const createProject = async (name: string) => {
  const [next] = await db
    .select({ id: sql<number>`coalesce(max(${projectTable.id}::bigint), 0) + 1` })
    .from(projectTable)
    .where(sql`${projectTable.id} ~ '^[0-9]+$'`)
  const [row] = await db
    .insert(projectTable)
    .values({
      id: String(next?.id ?? 1),
      name,
      publicKey: randomBytes(16).toString('hex'),
    })
    .returning()
  if (!row) throw new Error('project was not stored')
  return row
}
