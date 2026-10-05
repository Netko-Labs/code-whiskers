import type { AlertFiring } from '@/integrations/alerts-api'
import type { FiringTarget } from './types'

/** Issues open in the console; anything else follows the link the notice carried. */
export function firingTarget(firing: AlertFiring, origin: string): FiringTarget {
  if (firing.subjectKind === 'issue' && firing.subjectRef) {
    return { kind: 'issue', issueId: firing.subjectRef }
  }
  if (!firing.url) return { kind: 'none' }
  try {
    const url = new URL(firing.url)
    return url.origin === origin
      ? { kind: 'internal', href: `${url.pathname}${url.search}` }
      : { kind: 'external', href: url.toString() }
  } catch {
    return { kind: 'none' }
  }
}

export function firstLine(text: string): string {
  return text.split('\n')[0] ?? ''
}
