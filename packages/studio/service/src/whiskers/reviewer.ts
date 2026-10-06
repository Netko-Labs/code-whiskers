import { createLogger } from '@code-whiskers/logger'
import { studioEnvConfig } from '@code-whiskers/studio-config'
import {
  type WhiskersReviewer,
  WhiskersReviewerSchema,
  type WhiskersReviewerTest,
  WhiskersReviewerTestSchema,
} from '@code-whiskers/studio-domain'
import { REVIEWER_TEST_TIMEOUT_MS, WHISKERS_TIMEOUT_MS } from './constants'

const logger = createLogger('studio-whiskers')

/** The JSON body, or `null` when whiskers is unreachable, refuses, or `INTERNAL_TOKEN` is unset. */
async function askWhiskers(
  path: string,
  method: 'GET' | 'POST',
  timeoutMs: number,
): Promise<unknown> {
  const { url, internalToken } = studioEnvConfig.whiskers
  if (!internalToken) return null
  try {
    const response = await fetch(new URL(path, url), {
      method,
      headers: { authorization: `Bearer ${internalToken}`, accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (response.ok) return await response.json()
    logger.warn({ status: response.status, path }, 'whiskers refused a reviewer request')
  } catch (error) {
    logger.warn({ err: String(error), path }, 'whiskers unreachable for a reviewer request')
  }
  return null
}

export async function reviewerInWhiskers(): Promise<WhiskersReviewer | null> {
  const body = await askWhiskers('/internal/reviewer', 'GET', WHISKERS_TIMEOUT_MS)
  const parsed = WhiskersReviewerSchema.safeParse(body)
  return parsed.success ? parsed.data : null
}

/** An agentic provider may read for a while before it answers, hence the longer wait. */
export async function testReviewerInWhiskers(): Promise<WhiskersReviewerTest | null> {
  const body = await askWhiskers('/internal/reviewer/test', 'POST', REVIEWER_TEST_TIMEOUT_MS)
  const parsed = WhiskersReviewerTestSchema.safeParse(body)
  return parsed.success ? parsed.data : null
}
