import type { TriageActivityEntry } from './types'

/** Both sources already hold their newest entries, so the merged tail is the true newest. */
export function latestTimeline(
  entries: TriageActivityEntry[],
  limit: number,
): TriageActivityEntry[] {
  return entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).slice(-limit)
}
