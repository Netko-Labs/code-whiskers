import type { TriageItemRef } from '@/integrations/studio-api'

export type ConsoleSeverity = 'critical' | 'warning' | 'info' | 'ok' | 'idle'
export type ConsoleItemKind = 'error' | 'review' | 'log'
export type ConsoleTone = 'default' | 'body' | 'muted' | 'faint' | 'bad' | 'warn' | 'ok' | 'info'
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'OK'
export type DiffSign = '' | '+' | '-'

export type StackFrame = {
  no: string
  current?: boolean
  text: string
  tone: 'strong' | 'dim' | 'muted'
}

export type Breadcrumb = {
  time: string
  kind: string
  tone: ConsoleTone
  message: string
}

export type LogLine = {
  time: string
  level: LogLevel
  message: string
}

export type IssueTag = {
  key: string
  value: string
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
  events?: string
  users?: string
  trace?: StackFrame[]
  crumbs?: Breadcrumb[]
  logContext?: LogLine[]
  tags?: IssueTag[]
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
export type ErrorTab = 'stack' | 'crumbs' | 'logs' | 'tags'
