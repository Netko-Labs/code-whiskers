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
