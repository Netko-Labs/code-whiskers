export interface Hotspot {
  repository: string
  directory: string
  findings: number
  critical: number
  high: number
  medium: number
  low: number
  pullRequests: number
  lastSeen: Date
}

export interface StoreStats {
  table: string
  bytes: number
  rows: number
  isEstimate: boolean
  oldest: Date | null
}

export interface InstanceStats {
  telemetryRetentionDays: number
  databaseBytes: number
  stores: StoreStats[]
  activity: {
    reviews24h: number
    reviews7d: number
    failed7d: number
    inFlight: number
    medianReviewSeconds: number | null
    events24h: number
    events7d: number
  }
}

export interface ReleaseSummary {
  projectId: string
  release: string
  environment: string | null
  firstSeen: Date
  lastSeen: Date
  events: number
  issues: number
  newIssues: number
}

export interface LogFilter {
  service?: string
  level?: 'error' | 'warn'
  query?: string
  before?: number
}

export interface TraceSummary {
  traceId: string
  rootName: string
  rootService: string
  startedAt: Date
  durationMs: number
  spans: number
  errors: number
}

export interface ServiceSummary {
  service: string
  logs: number
  logErrors: number
  spans: number
  spanErrors: number
  p50Ms: number | null
  p95Ms: number | null
  lastSeen: Date | null
}

export interface LogPattern {
  hash: string
  projectId: string
  service: string
  pattern: string
  count: number
  firstSeen: Date
  lastSeen: Date
  hourly: number[]
  samples: { timestamp: Date; level: string; message: string }[]
}
