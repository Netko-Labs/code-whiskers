import { memoryNote } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'
import { findRepositoryBySlug } from './find-repository'
import type { RepositoryMemoryNote } from './types'

const MAX_TERMS = 40

/**
 * Free text (a PR title, file names, identifiers) as an any-word tsquery: `plainto_tsquery`
 * would demand every word, which a bag of file names never satisfies.
 */
export function anyWordQuery(text: string): string {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3)
  return [...new Set(words)].slice(0, MAX_TERMS).join(' | ')
}

/** Active notes for the repository and its installation; whiskers filters by path itself. */
export const getMemoryForRepository = async (
  slug: string,
  q = '',
): Promise<RepositoryMemoryNote[]> => {
  const repo = await findRepositoryBySlug(slug)
  if (!repo) return []
  const query = anyWordQuery(q)
  const rank = query
    ? sql<number>`ts_rank(${memoryNote.search}, to_tsquery('english', ${query}))`
    : sql<number>`0`
  return await db
    .select({
      id: memoryNote.id,
      kind: memoryNote.kind,
      body: memoryNote.body,
      paths: memoryNote.paths,
      isRepositoryNote: sql<boolean>`${memoryNote.repositoryId} is not null`,
      rank,
    })
    .from(memoryNote)
    .where(
      and(
        eq(memoryNote.installationId, repo.installationId),
        eq(memoryNote.status, 'active'),
        or(isNull(memoryNote.repositoryId), eq(memoryNote.repositoryId, repo.id)),
      ),
    )
    .orderBy(desc(rank), desc(memoryNote.uses), desc(memoryNote.updatedAt))
}
