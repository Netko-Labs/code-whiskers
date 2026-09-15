import type { ErrorSparkBar, LogLine } from './types'

export const REVIEW_LABEL = 'CODE REVIEW'
export const REVIEW_BOT = 'code-whiskers'
export const REVIEW_PR = '· PR #482'
export const REVIEW_LOCATION = 'client.ts:42'
export const REVIEW_SYMBOL = 'response.json()'
export const REVIEW_FINDING = ' unguarded; a non-JSON body throws past the caller.'
export const REVIEW_REMOVED = 'const data = await res.json()'
export const REVIEW_ADDED = 'const data = await safeJson(res)'
export const REVIEW_APPLY = 'Apply suggestion'
export const REVIEW_DISMISS = 'Dismiss'

export const ERROR_LABEL = 'ERROR TRACKING'
export const ERROR_SOURCE = 'Sentry · 10m ago'
export const ERROR_TITLE = 'TypeError: cart is undefined'
export const ERROR_LOCATION = 'checkout.ts:118 · release a41f2c'
export const ERROR_EVENTS = '128'
export const ERROR_EVENTS_LABEL = ' events'
export const ERROR_USERS = '41'
export const ERROR_USERS_LABEL = ' users'
export const ERROR_OPEN = 'Open issue'
export const ERROR_ASSIGN = 'Assign'
export const ERROR_RESOLVE = 'Resolve'

export const ERROR_SPARK: ErrorSparkBar[] = [
  { height: 10, hot: false },
  { height: 14, hot: false },
  { height: 8, hot: false },
  { height: 12, hot: false },
  { height: 10, hot: false },
  { height: 16, hot: false },
  { height: 40, hot: true },
  { height: 70, hot: true },
  { height: 100, hot: true },
  { height: 85, hot: true },
]

export const LOGS_LABEL = 'LOG INGESTION'
export const LOGS_RATE = '· 2.4k lines/s · 3 sources'
export const LOGS_SOURCES = ['api', 'worker', 'edge']
export const LOGS_TAIL = 'tail -f · prod'

export const LOG_LINES: LogLine[] = [
  { time: '14:02:09.881', level: 'INFO', source: 'api', text: 'POST /checkout 200', meta: '42ms' },
  {
    time: '14:02:10.114',
    level: 'WARN',
    source: 'worker',
    text: 'retrying job cart-sync',
    meta: 'attempt 2',
  },
  {
    time: '14:02:11.204',
    level: 'ERROR',
    source: 'api',
    text: 'TypeError: cart is undefined',
    meta: '→ checkout.ts:118',
  },
  { time: '14:02:11.205', level: 'INFO', source: 'edge', text: 'linked to issue #1207 · PR #482' },
]

export const LOG_LEVEL_CLASS: Record<LogLine['level'], string> = {
  INFO: 'text-severity-info',
  WARN: 'text-severity-warning',
  ERROR: 'text-severity-error',
}
