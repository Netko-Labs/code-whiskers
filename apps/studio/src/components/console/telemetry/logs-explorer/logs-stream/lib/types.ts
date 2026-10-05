import type { RefObject } from 'react'
import type { WhiskersLog } from '@/integrations/whiskers'

/** The newest line the reader has seen, and where the batch they just let in begins. */
export type TailAck = {
  id: number
  freshAfter: number
}

export type TailView = {
  visible: WhiskersLog[]
  pending: number
}

export type LiveTail = TailView & {
  freshAfter: number
  sentinelRef: RefObject<HTMLDivElement | null>
  showNew: () => void
}

export type LogStream = {
  lines: WhiskersLog[]
  isPending: boolean
  isError: boolean
  hasMore: boolean
  isLoadingMore: boolean
  loadMore: () => void
  retry: () => void
}

export type NewLinesPillProps = {
  count: number
  onShow: () => void
}

export type LogsStreamFooterProps = {
  shown: number
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}
