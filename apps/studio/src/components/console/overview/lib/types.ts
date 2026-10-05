import type { SearchSchemaInput } from '@tanstack/react-router'
import type { Tone } from '@/components/shared/status'
import type { OverviewRange, WhiskersOverview } from '@/integrations/whiskers'
import type { ConsoleItem, SectionRowLink } from '../../shared/console-model'

export type OverviewViewProps = {
  range: OverviewRange
}

export type OverviewSearch = {
  range: OverviewRange
}

export type OverviewSearchInput = {
  range?: string
} & SearchSchemaInput

export type OverviewData = {
  overview: WhiskersOverview | undefined
  isLoading: boolean
  isError: boolean
  retry: () => void
}

/** Counts that come from live lists rather than the ranged overview: they are "right now". */
export type OverviewSignals = {
  attention: ConsoleItem[]
  blockingReviews: number
  alertsFiring: number
  alertsArmed: number
  isLoading: boolean
}

export type OverviewStat = {
  key: string
  label: string
  value: number
  hint: string
  tone: Tone
  trend?: number[]
  isCompact?: boolean
}

export type OverviewStatsProps = {
  range: OverviewRange
  data: OverviewData
  signals: OverviewSignals
}

export type OverviewChartProps = {
  range: OverviewRange
  data: OverviewData
}

export type ChartPoint = {
  label: string
  events: number
  newIssues: number
}

export type OverviewAttentionProps = {
  signals: OverviewSignals
}

export type FeedActor = {
  name: string
  image: string | null
  isWhiskers: boolean
}

export type FeedLink =
  | { kind: 'issue'; issueId: string }
  | { kind: 'inbox'; itemId: string }
  | { kind: 'external'; href: string }

export type FeedEntry = {
  id: string
  at: Date
  actor: FeedActor
  verb: string
  subject: string
  tone: Tone
  link: FeedLink | null
}

export type ActivityFeed = {
  entries: FeedEntry[]
  isLoading: boolean
}

export type FeedEntryProps = {
  entry: FeedEntry
  isFresh: boolean
}

export type IssueTitles = Map<string, string>

export type OverviewBoardProps = OverviewViewProps

export type SetupActionProps = {
  link: SectionRowLink | null
  label: string
}
