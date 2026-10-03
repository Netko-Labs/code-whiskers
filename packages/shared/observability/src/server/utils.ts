import type { ErrorEvent } from '@sentry/node'
import { isIgnoredPath } from '../utils'
import { VENDOR_FRAME_MARKERS } from './constants'

/** The innermost `cause`: wrappers like drizzle's embed SQL params in their own message. */
export function innermostError(error: unknown): unknown {
  let current = error
  const seen = new Set<unknown>([current])
  while (current instanceof Error && current.cause instanceof Error && !seen.has(current.cause)) {
    current = current.cause
    seen.add(current)
  }
  return current
}

export function markVendorFrames(event: ErrorEvent): ErrorEvent {
  for (const value of event.exception?.values ?? []) {
    for (const frame of value.stacktrace?.frames ?? []) {
      const { filename = '' } = frame
      if (VENDOR_FRAME_MARKERS.some((marker) => filename.includes(marker))) frame.in_app = false
    }
  }
  return event
}

function pathOf(event: ErrorEvent): string | undefined {
  const tagged = event.tags?.path
  if (typeof tagged === 'string') return tagged
  if (!event.request?.url) return undefined
  try {
    return new URL(event.request.url, 'http://local').pathname
  } catch {
    return undefined
  }
}

/** An ingest outage must not report itself into the ingest it is failing. */
export const isFeedbackLoop = (event: ErrorEvent, ignoredPaths: readonly RegExp[]): boolean => {
  const path = pathOf(event)
  return path !== undefined && isIgnoredPath(path, ignoredPaths)
}
