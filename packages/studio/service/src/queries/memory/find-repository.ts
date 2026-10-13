import { repository } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, eq, sql } from 'drizzle-orm'
import type { RepositoryRef } from './types'

/** `owner/name` as whiskers sends it, matched case-insensitively like GitHub does. */
export const findRepositoryBySlug = async (slug: string): Promise<RepositoryRef | null> => {
  const [owner, name] = slug.split('/')
  if (!owner || !name) return null
  const [row] = await db
    .select({ id: repository.id, installationId: repository.installationId })
    .from(repository)
    .where(
      and(
        eq(sql`lower(${repository.owner})`, owner.toLowerCase()),
        eq(sql`lower(${repository.name})`, name.toLowerCase()),
      ),
    )
    .limit(1)
  return row ?? null
}
