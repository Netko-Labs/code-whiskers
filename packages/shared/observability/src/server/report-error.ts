import * as Sentry from '@sentry/node'
import type { ErrorScope } from '../types'
import { innermostError } from './utils'

const reported = new WeakSet<object>()

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null

/** Captures once per error object, however many seams see it. Never throws into the caller. */
export function reportError(error: unknown, { path, tags, userId }: ErrorScope = {}): void {
  if (!Sentry.getClient()) return
  const cause = innermostError(error)
  if ((isObject(error) && reported.has(error)) || (isObject(cause) && reported.has(cause))) return
  if (isObject(error)) reported.add(error)
  if (isObject(cause)) reported.add(cause)
  try {
    Sentry.captureException(cause, {
      tags: { ...tags, ...(path && { path }) },
      user: userId ? { id: userId } : undefined,
    })
  } catch {
    // A telemetry fault must never break the request or loop that hit the error.
  }
}
