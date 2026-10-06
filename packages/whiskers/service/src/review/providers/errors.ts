import type { ProviderFailureKind, ProviderFailureOptions } from './types'

/**
 * A failure of the provider itself, not of one slice: it ends the whole attempt. Transient ones
 * (rate limits, overload) go to the review-level retry; permanent ones (a dead credential, an
 * unknown model) fail the review with this message as its summary.
 */
export class ReviewProviderError extends Error {
  readonly kind: ProviderFailureKind
  readonly retryAtMs: number | undefined

  constructor(message: string, { kind, retryAtMs, cause }: ProviderFailureOptions) {
    super(message, { cause })
    this.name = 'ReviewProviderError'
    this.kind = kind
    this.retryAtMs = retryAtMs
  }

  get isTransient(): boolean {
    return this.kind === 'transient'
  }
}

const HTTP_AUTH_STATUSES = new Set([401, 403])

function statusOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const { statusCode, status } = error as { statusCode?: unknown; status?: unknown }
  const code = statusCode ?? status
  return typeof code === 'number' ? code : undefined
}

/** A rejected key fails every slice the same way; say so once instead of N skipped sections. */
export function classifyApiError(error: unknown, credential: string): unknown {
  const status = statusOf(error)
  if (status === undefined || !HTTP_AUTH_STATUSES.has(status)) return error
  return new ReviewProviderError(`the provider rejected ${credential} (HTTP ${status})`, {
    kind: 'permanent',
    cause: error,
  })
}
