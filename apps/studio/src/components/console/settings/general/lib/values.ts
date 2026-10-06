import type { Tone } from '@/components/shared/status'
import type { HealthStatus, ReviewerSandbox } from './types'

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

export const SANDBOX_TONE: Record<ReviewerSandbox, Tone> = {
  jail: 'resolved',
  docker: 'resolved',
  host: 'warning',
}

export const SANDBOX_LABEL: Record<ReviewerSandbox, string> = {
  jail: 'Landlock jail',
  docker: 'Docker sandbox',
  host: 'On the host',
}

export const SANDBOX_DETAIL: Record<ReviewerSandbox, string> = {
  jail: 'Unprivileged, read-only checkout, one writable home, network only to the model API',
  docker: 'Read-only checkout in a container whose only way out is the model API',
  host: 'Runs in the worker process; its file tools are confined to the read-only checkout',
}

export const JAIL_PROBE_PASSED =
  'A throwaway launcher dropped privileges, applied Landlock and seccomp, and stayed confined'
