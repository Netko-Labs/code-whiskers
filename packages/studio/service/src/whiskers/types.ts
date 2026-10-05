export interface WhiskersHealth {
  status: 'ok' | 'degraded' | 'unreachable'
  latencyMs: number | null
  checkedAt: Date
  release: string | null
}
