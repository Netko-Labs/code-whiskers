import type { WhiskersReviewVerdict } from '@/integrations/whiskers'
import type { VerdictLook } from './types'
import {
  DEFAULT_DEPLOY_ENVIRONMENT,
  DEPLOY_SHA_VARIABLE,
  REVIEW_FAILED,
  REVIEW_IN_FLIGHT,
  VERDICT_LOOKS,
} from './values'

/**
 * One line a deploy step can run as is: the version and sha come from the build's environment, the
 * key is the project's client key.
 */
export function deployCurl(
  origin: string,
  projectId: string,
  publicKey: string,
  environment = DEFAULT_DEPLOY_ENVIRONMENT,
): string {
  const sha = `$${DEPLOY_SHA_VARIABLE}`
  const body = `{"version":"${sha}","environment":"${environment}","commitSha":"${sha}"}`
  return [
    `curl -fsS -X POST ${origin}/api/${projectId}/deploys`,
    `-H "Authorization: DSN ${publicKey}"`,
    `-H "Content-Type: application/json"`,
    `-d "${body.replaceAll('"', '\\"')}"`,
  ].join(' ')
}

export const shortSha = (sha: string): string => sha.slice(0, 7)

export const commitSubject = (message: string): string => message.split('\n', 1)[0] ?? message

export const commitUrl = (repository: string, sha: string): string =>
  `https://github.com/${repository}/commit/${sha}`

export const pullUrl = (repository: string, prNumber: number): string =>
  `https://github.com/${repository}/pull/${prNumber}`

/** The reviewer's verdict reads as a status; a review still running or lost says so instead. */
export function verdictLook(review: WhiskersReviewVerdict): VerdictLook {
  if (review.verdict) return VERDICT_LOOKS[review.verdict] ?? REVIEW_IN_FLIGHT
  return review.status === 'failed' ? REVIEW_FAILED : REVIEW_IN_FLIGHT
}
