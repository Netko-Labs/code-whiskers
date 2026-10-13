import { createLogger } from '@code-whiskers/logger'
import { studioEnvConfig } from '@code-whiskers/studio-config'
import { type LoopReview, LoopReviewSchema } from '@code-whiskers/studio-domain'
import { WHISKERS_TIMEOUT_MS } from '../whiskers/constants'
import type { PrRef } from './types'

const logger = createLogger('studio-mcp')

/** The latest finished review of a pull request, `null` when it has none, or why it failed. */
export async function fetchLoopReview(
  pr: PrRef,
): Promise<{ review: LoopReview | null } | { error: string }> {
  const path = `/v1/reviews/pr/${pr.owner}/${pr.repo}/${pr.number}`
  try {
    const response = await fetch(new URL(path, studioEnvConfig.whiskers.url), {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(WHISKERS_TIMEOUT_MS),
    })
    if (response.status === 404) return { review: null }
    if (!response.ok) return { error: `whiskers answered ${response.status}` }
    const parsed = LoopReviewSchema.safeParse(await response.json())
    if (!parsed.success) {
      logger.warn({ path }, 'whiskers answered a review in an unknown shape')
      return { error: 'whiskers answered in an unknown shape' }
    }
    return { review: parsed.data }
  } catch (error) {
    logger.warn({ err: String(error) }, 'whiskers unreachable for a loop review')
    return { error: 'whiskers is unreachable' }
  }
}

/** Posts on the PR thread through the GitHub App, labelled as the agent; the PR stays the record. */
export async function postLoopReply(body: {
  pr: string
  id: string
  kind: string
  message: string
  agent: string
}): Promise<{ url: string } | { error: string }> {
  const { url, internalToken } = studioEnvConfig.whiskers
  if (!internalToken) return { error: 'whiskers is not configured' }
  try {
    const response = await fetch(new URL('/internal/loop/reply', url), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${internalToken}`,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(WHISKERS_TIMEOUT_MS),
    })
    const answer = (await response.json().catch(() => ({}))) as { url?: string; error?: string }
    if (!response.ok || !answer.url)
      return { error: answer.error ?? `whiskers answered ${response.status}` }
    return { url: answer.url }
  } catch (error) {
    logger.warn({ err: String(error) }, 'whiskers unreachable for a loop reply')
    return { error: 'whiskers is unreachable' }
  }
}
