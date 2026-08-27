import {
  EnvelopeItemHeaderSchema,
  type SentryEvent,
  SentryEventSchema,
} from '@code-whiskers/whiskers-domain'

/**
 * Sentry envelopes are newline-delimited JSON: envelope header, then repeating
 * (item header, payload) pairs. Only `event` items matter here; everything
 * else (sessions, client reports, transactions) is skipped.
 */
export function parseEnvelope(raw: string): SentryEvent[] {
  const lines = raw.split('\n').filter((line) => line.trim().length > 0)
  const events: SentryEvent[] = []

  let index = 1
  while (index < lines.length - 1) {
    const header = safeJson(lines[index])
    const itemHeader = header ? EnvelopeItemHeaderSchema.safeParse(header) : undefined
    if (!itemHeader?.success) {
      index += 1
      continue
    }
    const payload = safeJson(lines[index + 1])
    if (itemHeader.data.type === 'event' && payload) {
      const event = SentryEventSchema.safeParse(payload)
      if (event.success) events.push(event.data)
    }
    index += 2
  }
  return events
}

function safeJson(line: string | undefined): unknown {
  if (!line) return undefined
  try {
    return JSON.parse(line)
  } catch {
    return undefined
  }
}
