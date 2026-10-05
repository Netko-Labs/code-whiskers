export interface Hotspot {
  repository: string
  directory: string
  owners: string[]
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
  errorEventRetentionDays: number
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
  reviewer: {
    model: string | null
    meteredReviews7d: number
    inputTokens7d: number
    outputTokens7d: number
    reasoningTokens7d: number
  }
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

export interface OwnerRule {
  pattern: string
  owners: string[]
}
