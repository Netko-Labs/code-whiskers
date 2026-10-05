import {
  type SentryEvent,
  type SentryFrame,
  SentryStacktraceSchema,
} from '@code-whiskers/whiskers-domain'

function exceptions(event: SentryEvent) {
  if (Array.isArray(event.exception)) return event.exception
  return event.exception?.values ?? []
}

// Sentry orders chained exceptions innermost cause first, so the thrown error is the last value.
function thrownException(event: SentryEvent) {
  return exceptions(event).at(-1)
}

function isInApp(frame: SentryFrame): boolean {
  return frame.in_app !== false && !(frame.filename ?? '').includes('node_modules')
}

function culpritOf(stacktrace: unknown): string | undefined {
  const parsed = SentryStacktraceSchema.safeParse(stacktrace)
  const frame = parsed.success ? parsed.data.frames?.findLast(isInApp) : undefined
  // `module` is root-relative in server SDKs, so it survives a different checkout path.
  const file = frame?.module ?? frame?.filename ?? frame?.abs_path
  if (!file && !frame?.function) return undefined
  return `${file ?? ''}:${frame?.function ?? ''}`
}

/** The culprit of the thrown error, for a reader: where in our code it was raised. */
export function eventCulpritOf(event: SentryEvent): string | null {
  return culpritOf(thrownException(event)?.stacktrace) ?? null
}

export function messageOf(event: SentryEvent): string {
  const thrown = thrownException(event)
  if (thrown?.type || thrown?.value) return [thrown.type, thrown.value].filter(Boolean).join(': ')
  if (typeof event.message === 'string') return event.message
  if (event.message?.formatted) return event.message.formatted
  if (event.logentry?.message) return event.logentry.message
  return 'Unknown event'
}

export function levelOf(event: SentryEvent): string {
  return event.level ?? (exceptions(event).length > 0 ? 'error' : 'info')
}

/** SDK fingerprint wins; else the thrown error + its top in-app frame; else the message. */
export function fingerprintOf(event: SentryEvent): string {
  if (event.fingerprint && event.fingerprint.length > 0) return event.fingerprint.join('|')
  const thrown = thrownException(event)
  if (!thrown) return `msg|${messageOf(event)}`
  const identity = `${thrown.type ?? 'Error'}|${thrown.value ?? ''}`
  const culprit = culpritOf(thrown.stacktrace)
  return culprit ? `${identity}|${culprit}` : identity
}
