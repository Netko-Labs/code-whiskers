export const HOTSPOT_WINDOW_MS = 90 * 24 * 60 * 60 * 1000
export const HOTSPOT_DIRECTORY_DEPTH = 3
// Counting an unbounded telemetry table exactly would scan it; past this, the planner's estimate.
export const EXACT_COUNT_LIMIT = 100_000
export const STORES = [
  { table: 'review', oldest: 'created_at' },
  { table: 'finding', oldest: 'created_at' },
  { table: 'issue', oldest: 'first_seen' },
  { table: 'event', oldest: 'received_at' },
  { table: 'project', oldest: 'created_at' },
] as const
