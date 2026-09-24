import { createLogger } from '@code-whiskers/logger'
import { readFromStudio } from './studio-client'

const logger = createLogger('whiskers-suppressions')

export interface Suppression {
  itemKind: string
  itemRef: string
  status: string
  note: string | null
}

/** What humans have already dismissed, resolved or snoozed on this repo. */
export async function fetchSuppressions(scope: string): Promise<Suppression[]> {
  const { value, headers } = await readFromStudio<Suppression[]>('suppressions', { scope }, [])
  if (headers.get('x-suppressions-truncated') === 'true') {
    logger.warn({ scope, kept: value.length }, 'suppressions truncated; oldest decisions dropped')
  }
  return value
}
