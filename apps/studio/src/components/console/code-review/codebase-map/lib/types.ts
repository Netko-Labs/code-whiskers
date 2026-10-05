import type { Tone } from '@/components/shared/status'
import type { WhiskersHotspot } from '@/integrations/whiskers'

export type HotspotSegment = {
  key: string
  tone: Tone
  count: number
  percent: number
}

export type HotspotRow = {
  spot: WhiskersHotspot
  key: string
  blocking: number
  segments: HotspotSegment[]
}

export type HotspotMapState = {
  rows: HotspotRow[]
  total: number
  blocking: number
  unowned: number
  repositories: number
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export type HotspotFilter = {
  isBlockingOnly: boolean
  query: string
}

export type HotspotRowProps = {
  row: HotspotRow
}

export type CodebaseMapBodyProps = {
  state: HotspotMapState
  isFiltered: boolean
}
