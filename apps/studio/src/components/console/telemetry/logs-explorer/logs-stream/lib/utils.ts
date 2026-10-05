import type { WhiskersLog } from '@/integrations/whiskers'
import type { TailAck, TailView } from './types'

/**
 * Live tail holds the stream still: lines newer than the acknowledged one wait behind the pill
 * instead of pushing the reader's rows down. Without an ack everything shows.
 */
export function tailView(lines: WhiskersLog[], ack: TailAck | null): TailView {
  if (!ack) return { visible: lines, pending: 0 }
  const visible = lines.filter((line) => line.id <= ack.id)
  return { visible, pending: lines.length - visible.length }
}

export function nextAck(lines: WhiskersLog[], ack: TailAck | null): TailAck {
  const newest = lines[0]?.id ?? 0
  if (!ack) return { id: newest, freshAfter: newest }
  return newest > ack.id ? { id: newest, freshAfter: ack.id } : ack
}
