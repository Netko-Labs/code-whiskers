import {
  EnvelopeItemHeaderSchema,
  type SentryEvent,
  SentryEventSchema,
} from '@code-whiskers/whiskers-domain'
import { NEWLINE } from './constants'

const decoder = new TextDecoder()

function lineEnd(bytes: Uint8Array, from: number): number {
  const index = bytes.indexOf(NEWLINE, from)
  return index === -1 ? bytes.length : index
}

function safeJson(bytes: Uint8Array): unknown {
  try {
    return JSON.parse(decoder.decode(bytes))
  } catch {
    return undefined
  }
}

/**
 * Envelope header, then (item header, payload) pairs. A payload is `length` bytes when the item
 * header declares it (attachments and replays are binary), else runs to the next newline. Only
 * `event` items are kept.
 */
export function parseEnvelope(raw: Uint8Array | string): SentryEvent[] {
  const bytes = typeof raw === 'string' ? new TextEncoder().encode(raw) : raw
  const events: SentryEvent[] = []

  let cursor = lineEnd(bytes, 0) + 1
  while (cursor < bytes.length) {
    const headerEnd = lineEnd(bytes, cursor)
    const header = safeJson(bytes.subarray(cursor, headerEnd))
    cursor = headerEnd + 1
    const itemHeader = header ? EnvelopeItemHeaderSchema.safeParse(header) : undefined
    if (!itemHeader?.success) continue

    const { length, type } = itemHeader.data
    const payloadEnd = length === undefined ? lineEnd(bytes, cursor) : cursor + length
    const payload = bytes.subarray(cursor, payloadEnd)
    cursor = bytes[payloadEnd] === NEWLINE ? payloadEnd + 1 : payloadEnd
    if (type !== 'event') continue
    const event = SentryEventSchema.safeParse(safeJson(payload))
    if (event.success) events.push(event.data)
  }
  return events
}

export function parseStoreEvent(bytes: Uint8Array): SentryEvent | undefined {
  const event = SentryEventSchema.safeParse(safeJson(bytes))
  return event.success ? event.data : undefined
}
