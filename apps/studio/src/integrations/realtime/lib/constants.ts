import type { RealtimeTopic } from './types'

export const REALTIME_PATH = '/realtime'
export const RECONNECT_BASE_MS = 1_000
export const RECONNECT_MAX_MS = 30_000
export const CLOSE_NORMAL = 1000
export const CLOSE_SESSION_EXPIRED = 4001
export const PONG = JSON.stringify({ type: 'pong' })

/** Which whiskers queries each topic makes stale — prefixes under the `whiskers` root key. */
export const TOPIC_QUERY_KEYS: Record<RealtimeTopic, string[]> = {
  reviews: ['reviews', 'overview', 'instance', 'hotspots'],
  issues: [
    'issues',
    'issue',
    'issue-events',
    'issue-event',
    'overview',
    'releases',
    'projects',
    'project',
    'latest-issue',
  ],
  logs: ['logs', 'log-patterns', 'services'],
  traces: ['traces', 'services'],
}

/** Studio's own queries a topic makes stale: decisions, their activity, and alerts that fire on them. */
export const TOPIC_STUDIO_QUERY_KEYS: Partial<Record<RealtimeTopic, string[]>> = {
  issues: ['triage', 'triage-activity', 'alerts'],
  reviews: ['alerts'],
}
