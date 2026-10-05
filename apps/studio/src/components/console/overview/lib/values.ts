import type { ChartConfig } from '@code-whiskers/ui/components/chart'
import type { OverviewRange } from '@/integrations/whiskers'

export const DEFAULT_RANGE: OverviewRange = '7d'

export const RANGE_OPTIONS: { value: OverviewRange; label: string; long: string }[] = [
  { value: '24h', label: '24h', long: 'the last 24 hours' },
  { value: '7d', label: '7d', long: 'the last 7 days' },
  { value: '30d', label: '30d', long: 'the last 30 days' },
]

export const ATTENTION_LIMIT = 8
export const FEED_LIMIT = 14

export const EVENTS_CHART: ChartConfig = {
  events: { label: 'Events', color: 'var(--chart-1)' },
  newIssues: { label: 'New issues', color: 'var(--severity-error)' },
}

export const ACTIVITY_VERBS: Record<string, string> = {
  resolved: 'resolved',
  unresolved: 'reopened',
  archived: 'archived',
  regressed: 'saw a regression in',
  unarchived: 'brought back',
  assigned: 'assigned',
  commented: 'commented on',
}

export const REVIEW_VERBS = {
  approve: 'approved',
  request_changes: 'requested changes on',
  comment: 'reviewed',
  failed: 'could not review',
} as const

export const WHISKERS_NAME = 'Whiskers'
