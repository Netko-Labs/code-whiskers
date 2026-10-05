import type { Tone } from '@/components/shared/status'
import type { WhiskersServiceStats } from '@/integrations/whiskers'
import type { RangeSearch } from '../../shared/telemetry-time'

export type ServicesSearch = RangeSearch

export type ServicesPageProps = {
  search: ServicesSearch
}

export type ServiceStatsState = {
  services: WhiskersServiceStats[]
  windowMs: number
  isPending: boolean
  isError: boolean
  retry: () => void
}

export type ServiceCardProps = {
  stats: WhiskersServiceStats
  windowMs: number
  search: ServicesSearch
}

export type ServiceMetricProps = {
  label: string
  value: string
  hint?: string
  values: number[]
  tone: Tone
  variant: 'line' | 'bars'
}

export type ServiceSeries = {
  requests: number[]
  errors: number[]
  p50: number[]
  p95: number[]
}
