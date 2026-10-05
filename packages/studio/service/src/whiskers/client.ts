import { createLogger } from '@code-whiskers/logger'
import { studioEnvConfig } from '@code-whiskers/studio-config'
import {
  type AlertPreviewResult,
  AlertPreviewResultSchema,
  type IssueLifecycle,
  IssueLifecycleListSchema,
  type WhiskersAlertPreviewBody,
  type WhiskersLifecycleBody,
} from '@code-whiskers/studio-domain'
import { WHISKERS_TIMEOUT_MS } from './constants'

const logger = createLogger('studio-whiskers')

/**
 * Writes a lifecycle decision through to whiskers' mirror with the shared token. `null` on any
 * failure: studio's own write already stands, and the mirror sweep retries what did not land.
 */
export async function mirrorIssueLifecycle(
  body: WhiskersLifecycleBody,
): Promise<IssueLifecycle[] | null> {
  const { url, internalToken } = studioEnvConfig.whiskers
  if (!internalToken) return null
  try {
    const response = await fetch(new URL('/internal/issues/lifecycle', url), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${internalToken}`,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(WHISKERS_TIMEOUT_MS),
    })
    if (!response.ok) {
      logger.warn({ status: response.status }, 'whiskers refused an issue lifecycle write')
      return null
    }
    const parsed = IssueLifecycleListSchema.safeParse(await response.json())
    if (!parsed.success) logger.warn('whiskers answered a lifecycle write in an unknown shape')
    return parsed.success ? parsed.data.issues : null
  } catch (error) {
    logger.warn({ err: String(error) }, 'whiskers unreachable for an issue lifecycle write')
    return null
  }
}

/** `null` when whiskers is unreachable or unconfigured; the editor then hides the preview line. */
export async function previewInWhiskers(
  body: WhiskersAlertPreviewBody,
): Promise<AlertPreviewResult | null> {
  const { url, internalToken } = studioEnvConfig.whiskers
  if (!internalToken) return null
  try {
    const response = await fetch(new URL('/internal/alerts/preview', url), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${internalToken}`,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(WHISKERS_TIMEOUT_MS),
    })
    if (!response.ok) {
      logger.warn({ status: response.status }, 'whiskers refused an alert preview')
      return null
    }
    const parsed = AlertPreviewResultSchema.safeParse(await response.json())
    return parsed.success ? parsed.data : null
  } catch (error) {
    logger.warn({ err: String(error) }, 'whiskers unreachable for an alert preview')
    return null
  }
}
