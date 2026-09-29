import type { HttpFailure } from './types'

// Provider stalls and GitHub 5xx clear within minutes; a third failure is worth a human's look.
export const RETRY_DELAYS_MS = [30_000, 120_000]

/**
 * Worth another attempt: no HTTP status (network, provider timeout), a timeout or rate limit, or
 * a 5xx. A 4xx from GitHub or the provider — gone, forbidden, invalid — fails the same way again.
 */
export function isTransient(error: unknown): boolean {
  const { status, statusCode } = (error ?? {}) as HttpFailure
  const code = status ?? statusCode
  if (code === undefined) return true
  return code === 408 || code === 429 || code >= 500
}
