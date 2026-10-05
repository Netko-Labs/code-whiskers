export const ALERT_INTERVAL_MS = 60_000
export const ALERT_FIRST_RUN_MS = 15_000
/** Event triggers never look further back than this, even after a long outage. */
export const ALERT_LOOKBACK_MS = 15 * 60_000
/** Rows committed just after the previous pass read; studio drops the repeats. */
export const ALERT_OVERLAP_MS = 30_000
export const ALERT_MAX_FIRINGS = 20
export const PREVIEW_DAYS = 7
export const PREVIEW_ROW_CAP = 5_000
export const DAY_MS = 86_400_000
