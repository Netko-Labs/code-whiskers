export const HOUR_MS = 3_600_000
export const DAY_MS = 24 * HOUR_MS
export const LOG_PAGE = 200
export const TRACE_PAGE = 100
export const LOG_WINDOW_MS = 7 * DAY_MS
export const VOLUME_WINDOW_MS = DAY_MS
export const TRACE_WINDOW_MS = DAY_MS
export const STATS_WINDOW_MS = DAY_MS
export const ERROR_LEVELS = ['ERROR', 'FATAL']
export const LEVEL_BANDS = ['error', 'warn', 'info', 'debug'] as const
export const TRACE_CONTEXT_ERRORS = 20
// Error events and log lines arrive on their own clocks; look this far either side of the spans.
export const TRACE_CONTEXT_SLACK_MS = 15 * 60_000
export const MIN_STEP_MS = 1_000
