import { createLogger } from '@code-whiskers/logger'
import { readFromStudio } from './studio-client'

const logger = createLogger('whiskers-suppressions')

export interface Suppression {
  itemKind: string
  itemRef: string
  status: string
  note: string | null
}

/**
 * Findings humans have already dismissed, resolved or snoozed on this repo. The scope also
 * holds review and issue decisions, which mean nothing to a reviewer.
 */
export async function fetchSuppressions(scope: string): Promise<Suppression[]> {
  const { value, headers } = await readFromStudio<Suppression[]>('suppressions', { scope }, [])
  if (headers.get('x-suppressions-truncated') === 'true') {
    logger.warn({ scope, kept: value.length }, 'suppressions truncated; oldest decisions dropped')
  }
  return value.filter((suppression) => suppression.itemKind === 'finding')
}
