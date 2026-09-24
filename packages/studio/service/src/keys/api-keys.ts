import { createHash, randomBytes } from 'node:crypto'
import { type ApiKeyCreate, apiKey } from '@code-whiskers/studio-domain'
import { db } from '@code-whiskers/studio-repository'
import { and, desc, eq, isNull, lt, or } from 'drizzle-orm'
import { API_KEY_BYTES, API_KEY_PREFIX, LAST_USED_RESOLUTION_MS } from './constants'
import type { ApiKeyRecord, CreatedApiKey } from './types'

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export const createApiKey = async (userId: string, input: ApiKeyCreate): Promise<CreatedApiKey> => {
  const key = `${API_KEY_PREFIX}${randomBytes(API_KEY_BYTES).toString('base64url')}`
  const [row] = await db
    .insert(apiKey)
    .values({ userId, name: input.name, prefix: key.slice(0, 10), hash: hashKey(key) })
    .returning({ id: apiKey.id })
  if (!row) throw new Error('api key was not stored')
  return { id: row.id, key }
}

export const getApiKeysForUser = async (userId: string): Promise<ApiKeyRecord[]> => {
  return await db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      lastUsedAt: apiKey.lastUsedAt,
      revokedAt: apiKey.revokedAt,
      createdAt: apiKey.createdAt,
    })
    .from(apiKey)
    .where(eq(apiKey.userId, userId))
    .orderBy(desc(apiKey.createdAt))
}

export const revokeApiKey = async (userId: string, id: string): Promise<boolean> => {
  const rows = await db
    .update(apiKey)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKey.id, id), eq(apiKey.userId, userId), isNull(apiKey.revokedAt)))
    .returning({ id: apiKey.id })
  return rows.length > 0
}

/** The owner of a live key, or null. Touches last_used_at at most once a minute. */
export const verifyApiKey = async (key: string): Promise<string | null> => {
  if (!key.startsWith(API_KEY_PREFIX)) return null
  const hash = hashKey(key)
  const [row] = await db
    .select({ id: apiKey.id, userId: apiKey.userId })
    .from(apiKey)
    .where(and(eq(apiKey.hash, hash), isNull(apiKey.revokedAt)))
    .limit(1)
  if (!row) return null

  const stale = new Date(Date.now() - LAST_USED_RESOLUTION_MS)
  await db
    .update(apiKey)
    .set({ lastUsedAt: new Date() })
    .where(and(eq(apiKey.id, row.id), or(isNull(apiKey.lastUsedAt), lt(apiKey.lastUsedAt, stale))))
  return row.userId
}
