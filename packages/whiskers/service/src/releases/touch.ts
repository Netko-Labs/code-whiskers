import { releaseTable } from '@code-whiskers/whiskers-domain'
import { db } from '@code-whiskers/whiskers-repository'
import { sql } from 'drizzle-orm'
import { MAX_TOUCHED_RELEASES, RELEASE_TOUCH_INTERVAL_MS } from './constants'
import { syncReleaseCommits } from './sync'
import { pairKey } from './utils'

const touchedAt = new Map<string, number>()

export function isReleaseTouchDue(key: string, now: number): boolean {
  const last = touchedAt.get(key)
  if (last !== undefined && now - last < RELEASE_TOUCH_INTERVAL_MS) return false
  if (touchedAt.size >= MAX_TOUCHED_RELEASES) touchedAt.clear()
  touchedAt.set(key, now)
  return true
}

/** Creates the release on first sight, else moves `last_seen`; true when the row is new. */
export async function upsertSeenRelease(
  projectId: string,
  version: string,
  seenAt: Date,
): Promise<{ id: string; isNew: boolean } | undefined> {
  const [row] = await db
    .insert(releaseTable)
    .values({ projectId, version, firstSeen: seenAt, lastSeen: seenAt })
    .onConflictDoUpdate({
      target: [releaseTable.projectId, releaseTable.version],
      set: { lastSeen: sql`greatest(${releaseTable.lastSeen}, excluded.last_seen)` },
    })
    .returning({ id: releaseTable.id, isNew: sql<boolean>`(xmax = 0)` })
  return row
}

/** Fire-and-forget from ingest: one write per release a minute, never on the event's path. */
export function touchRelease(projectId: string, version: string, seenAt: Date): void {
  const key = pairKey(projectId, version)
  if (!isReleaseTouchDue(key, Date.now())) return
  void upsertSeenRelease(projectId, version, seenAt)
    .then((row) => {
      if (row?.isNew) void syncReleaseCommits(row.id)
    })
    .catch(() => touchedAt.delete(key))
}
