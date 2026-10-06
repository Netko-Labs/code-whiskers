import type { Tone } from '@/components/shared/status'
import type { HealthStatus } from './types'

export const HEALTH_TONE: Record<HealthStatus, Tone> = {
  ok: 'resolved',
  degraded: 'warning',
  unreachable: 'error',
}

export const HEALTH_LABEL: Record<HealthStatus, string> = {
  ok: 'Up',
  degraded: 'Degraded',
  unreachable: 'Unreachable',
}

export const HEALTH_DETAIL: Record<HealthStatus, string> = {
  ok: 'Reviews, ingest and /v1 are answering',
  degraded: 'Answering, but its database check failed',
  unreachable: 'No answer from WHISKERS_URL within 3 seconds',
}
