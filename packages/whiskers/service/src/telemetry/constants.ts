/** One request may not flood the table; exporters batch far below this. */
export const MAX_RECORDS_PER_REQUEST = 5_000
export const MAX_MESSAGE_CHARS = 8_000
export const INSERT_BATCH = 500
export const UNKNOWN_SERVICE = 'unknown'
export const SEVERITY_LEVELS = [
  { upTo: 4, level: 'TRACE' },
  { upTo: 8, level: 'DEBUG' },
  { upTo: 12, level: 'INFO' },
  { upTo: 16, level: 'WARN' },
  { upTo: 20, level: 'ERROR' },
  { upTo: 24, level: 'FATAL' },
] as const
export const RETENTION_INTERVAL_MS = 60 * 60 * 1000
