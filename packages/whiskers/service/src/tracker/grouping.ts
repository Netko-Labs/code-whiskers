import type { SentryEvent } from '@code-whiskers/whiskers-domain'

function exceptions(event: SentryEvent) {
  if (Array.isArray(event.exception)) return event.exception
  return event.exception?.values ?? []
}

export function messageOf(event: SentryEvent): string {
  const [first] = exceptions(event)
  if (first?.type || first?.value) return [first.type, first.value].filter(Boolean).join(': ')
  if (typeof event.message === 'string') return event.message
  if (event.message?.formatted) return event.message.formatted
  if (event.logentry?.message) return event.logentry.message
  return 'Unknown event'
}

export function levelOf(event: SentryEvent): string {
  return event.level ?? (exceptions(event).length > 0 ? 'error' : 'info')
}

/** Explicit SDK fingerprint wins; otherwise group by exception identity or message. */
export function fingerprintOf(event: SentryEvent): string {
  if (event.fingerprint && event.fingerprint.length > 0) return event.fingerprint.join('|')
  const [first] = exceptions(event)
  if (first) return `${first.type ?? 'Error'}|${first.value ?? ''}`
  return `msg|${messageOf(event)}`
}
