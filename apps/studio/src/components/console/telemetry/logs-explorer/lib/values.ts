import type { RangeKey } from '../../shared/telemetry-time'

export const LOG_RANGE_FALLBACK: RangeKey = '1h'
export const VOLUME_BUCKETS = 60
export const MAX_ATTRS = 10

/** Old `?tab=` links: 1 was errors, 2 warnings. */
export const LEGACY_TAB_LEVELS = {
  1: ['error', 'fatal'],
  2: ['warn'],
} as const

export const TRACE_KEYS = ['trace', 'trace_id', 'traceid']
export const LEVEL_KEYS = ['level', 'severity']
export const SERVICE_KEYS = ['service', 'service.name']

export const QUERY_HINT = 'service:api level:error http.status_code:500 or plain text'
