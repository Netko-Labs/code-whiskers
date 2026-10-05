import { sql } from 'drizzle-orm'

export const HOUR_MS = 60 * 60 * 1000
export const DAY_MS = 24 * HOUR_MS
export const TREND_DAYS = 14
export const HISTOGRAM_HOURS = 24
export const NEW_ISSUE_WINDOW_MS = 7 * DAY_MS
export const REGRESSED_WINDOW_MS = 7 * DAY_MS
export const SPIKE_BASELINE_HOURS = 7 * 24
export const SPIKE_MIN_EVENTS = 10
export const SPIKE_FACTOR = 10
export const TAG_SAMPLE_EVENTS = 1_000
export const TOP_TAG_KEYS = 10
export const TOP_TAG_VALUES = 5
export const BREAKDOWN_LIMIT = 20
export const TRACE_LOG_LIMIT = 50
/** Bucket width and count per overview range: enough points for a chart, few enough for a spark. */
export const OVERVIEW_WINDOWS = {
  '24h': { stepMs: HOUR_MS, length: 24 },
  '7d': { stepMs: 6 * HOUR_MS, length: 28 },
  '30d': { stepMs: DAY_MS, length: 30 },
} as const
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** bun-sql writes jsonb as a JSON string scalar; rows written by other clients are objects. */
export const EVENT_PAYLOAD = sql.raw(
  `(case when jsonb_typeof(payload) = 'string' then (payload #>> '{}')::jsonb else payload end)`,
)
