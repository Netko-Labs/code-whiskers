import type { InstanceHealth } from '@/integrations/studio-api'
import type { WhiskersInstance } from '@/integrations/whiskers'

export type InstanceNameForm = {
  name: string
  error: string | null
  isDirty: boolean
  isPending: boolean
  setName: (name: string) => void
  reset: () => void
  save: () => void
}

export type StoreRow = {
  table: string
  database: 'whiskers' | 'studio'
  bytes: number
  rows: number
  isEstimate: boolean
  oldest: Date | null
}

export type InstanceUsage = {
  worker: WhiskersInstance | undefined
  stores: StoreRow[]
  databaseBytes: number
  isLoading: boolean
  isError: boolean
  retry: () => void
}

export type HealthStatus = InstanceHealth['status']

export type InstanceStorageProps = {
  stores: StoreRow[]
  retentionNote: string
}

export type InstanceReviewerProps = {
  reviewer: NonNullable<WhiskersInstance['reviewer']>
}
