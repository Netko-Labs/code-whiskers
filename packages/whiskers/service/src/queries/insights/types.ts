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
