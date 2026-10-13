import {
  memoryActivity,
  memoryNote,
  organization,
  organizationMember,
  repository,
  user,
} from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { type AnyColumn, and, desc, eq, sql } from 'drizzle-orm'
import type { MemoryActivityRecord, MemoryNoteRecord } from './types'

const ACTIVITY_LIMIT = 200

const memberOf = (userId: string, installationId: AnyColumn) =>
  and(eq(organizationMember.installationId, installationId), eq(organizationMember.userId, userId))

export const getMemoryForUser = async (userId: string): Promise<MemoryNoteRecord[]> => {
  return await db
    .select({
      id: memoryNote.id,
      installationId: memoryNote.installationId,
      organization: organization.login,
      repositoryId: memoryNote.repositoryId,
      repository: sql<string | null>`${repository.owner} || '/' || ${repository.name}`,
      kind: memoryNote.kind,
      body: memoryNote.body,
      paths: memoryNote.paths,
      source: memoryNote.source,
      sourceUrl: memoryNote.sourceUrl,
      authorName: sql<string | null>`coalesce(${user.name}, ${memoryNote.authorLabel})`,
      status: memoryNote.status,
      uses: memoryNote.uses,
      lastUsedAt: memoryNote.lastUsedAt,
      createdAt: memoryNote.createdAt,
      updatedAt: memoryNote.updatedAt,
    })
    .from(memoryNote)
    .innerJoin(organization, eq(organization.installationId, memoryNote.installationId))
    .innerJoin(organizationMember, memberOf(userId, memoryNote.installationId))
    .leftJoin(repository, eq(repository.id, memoryNote.repositoryId))
    .leftJoin(user, eq(user.id, memoryNote.authorUserId))
    .orderBy(desc(memoryNote.updatedAt))
}

/** Newest first: the audit trail a human reads to see what the reviewer learned. */
export const getMemoryActivity = async (userId: string): Promise<MemoryActivityRecord[]> => {
  return await db
    .select({
      id: memoryActivity.id,
      installationId: memoryActivity.installationId,
      organization: organization.login,
      noteId: memoryActivity.noteId,
      action: memoryActivity.action,
      actorName: sql<string | null>`coalesce(${user.name}, ${memoryActivity.actorLabel})`,
      before: memoryActivity.before,
      after: memoryActivity.after,
      undoneAt: memoryActivity.undoneAt,
      createdAt: memoryActivity.createdAt,
    })
    .from(memoryActivity)
    .innerJoin(organization, eq(organization.installationId, memoryActivity.installationId))
    .innerJoin(organizationMember, memberOf(userId, memoryActivity.installationId))
    .leftJoin(user, eq(user.id, memoryActivity.actorUserId))
    .orderBy(desc(memoryActivity.createdAt))
    .limit(ACTIVITY_LIMIT)
}
