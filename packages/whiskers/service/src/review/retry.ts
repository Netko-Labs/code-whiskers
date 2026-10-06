import { ReviewProviderError } from './providers'
import type { HttpFailure } from './types'

// Provider stalls and GitHub 5xx clear within minutes; a third failure is worth a human's look.
export const RETRY_DELAYS_MS = [30_000, 120_000]
// A usage limit that resets later than this is reported, not slept on: the review holds a slot.
export const MAX_RETRY_WAIT_MS = 15 * 60_000

/**
 * Worth another attempt: no HTTP status (network, provider timeout), a timeout or rate limit, or
 * a 5xx. A 4xx from GitHub or the provider — gone, forbidden, invalid — fails the same way again.
 */
export function isTransient(error: unknown): boolean {
  if (error instanceof ReviewProviderError) return error.isTransient
  const { status, statusCode } = (error ?? {}) as HttpFailure
  const code = status ?? statusCode
  if (code === undefined) return true
  return code === 408 || code === 429 || code >= 500
}

/** How long to wait before attempt `attempt + 1`, or undefined when the review should fail now. */
export function retryDelayFor(
  error: unknown,
  attempt: number,
  now = Date.now(),
): number | undefined {
  const delay = RETRY_DELAYS_MS[attempt]
  if (delay === undefined || !isTransient(error)) return undefined
  if (!(error instanceof ReviewProviderError) || error.retryAtMs === undefined) return delay
  const wait = error.retryAtMs - now
  return wait > MAX_RETRY_WAIT_MS ? undefined : Math.max(delay, wait)
}
