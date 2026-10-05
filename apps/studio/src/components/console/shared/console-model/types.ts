import type { TriageItemRef } from '@/integrations/studio-api'
import type { WhiskersIssue } from '@/integrations/whiskers'

export type ConsoleSeverity = 'critical' | 'warning' | 'info' | 'ok' | 'idle'
export type ConsoleItemKind = 'error' | 'review' | 'log'
export type ConsoleTone = 'default' | 'body' | 'muted' | 'faint' | 'bad' | 'warn' | 'ok' | 'info'
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'OK'
export type DiffSign = '' | '+' | '-'

export type LogLine = {
  time: string
  level: LogLevel
  message: string
}

export type DiffLine = {
  no: string
  sign: DiffSign
  text: string
}

export type ReviewFile = {
  path: string
  diff: string
  note: string
  tone: ConsoleTone
}

export type MetricBar = {
  percent: number
  hot: boolean
}

export type FixPlan = {
  title: string
  subtitle: string
  note: string
  file: string
  cta: string
  hunk: DiffLine[]
  steps: string[]
}

export type ConsoleItem = {
  id: string
  handle: string
  triage: TriageItemRef | null
  sourceId?: string
  url?: string
  commit?: string
  at?: Date
  kind: ConsoleItemKind
  repository: string | null
  projectId?: string
  scopeLabel: string
  label: string
  severity: ConsoleSeverity
  age: string
  title: string
  subtitle: string
  meta: string
  badge: string
  badge2: string
  confidence: string
  read: string
  fixLabel: string
  evidenceLabel: string
  fix?: FixPlan
  /** Error items carry their whiskers row: status, badges and trend come from the server. */
  issue?: WhiskersIssue
  diff?: string
  fileCount?: string
  checks?: string
  author?: string
  blockerFile?: string
  blockerKind?: string
  blockerNote?: string
  hunk?: DiffLine[]
  files?: ReviewFile[]
  metricLabel?: string
  metricSub?: string
  metric?: string
  metricDelta?: string
  matchCount?: string
  bars?: MetricBar[]
  axis?: string[]
  lines?: LogLine[]
}

export type ConsoleNotification = {
  title: string
  when: string
  severity: ConsoleSeverity
  itemId: string
}

export type ConsoleOrg = {
  login: string
  isOrganization: boolean
  name: string
  meta: string
  mono: string
  tint: string
}

export type TriageBucket = 'inbox' | 'assigned' | 'snoozed'
export type TriageFilter = 'all' | 'errors' | 'reviews' | 'logs'

export type TriageStatus = {
  resolved: boolean
  archived: boolean
  /** Whiskers saw it again after a resolve; the badge is server data, never inferred here. */
  regressed: boolean
  approved: boolean
  tracked: boolean
  /** Set only while the snooze is still running; an expired one reads as open. */
  snoozedUntil: Date | null
  assigneeUserId: string | null
  decidedAt: Date | null
  done: boolean
}
