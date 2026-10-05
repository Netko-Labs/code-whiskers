import {
  ALERT_LEVELS,
  type AlertDeliveryRecord,
  type AlertLevel,
  type AlertTrigger,
} from '@code-whiskers/studio-domain'
import type { FiringStatus, IssueSignal, RuleFilters } from './types'

const LEVEL_RANK = new Map<string, number>(ALERT_LEVELS.map((level, rank) => [level, rank]))

/** Sentry's `warn` and `critical` spellings rank with their canonical names. */
export function levelRank(level: string | null | undefined): number {
  const normal = level?.toLowerCase()
  if (normal === 'warn') return LEVEL_RANK.get('warning') ?? -1
  if (normal === 'critical') return LEVEL_RANK.get('fatal') ?? -1
  return normal ? (LEVEL_RANK.get(normal) ?? -1) : -1
}

export function isLevelAtLeast(level: string | null | undefined, min: AlertLevel | null): boolean {
  return min === null || levelRank(level) >= levelRank(min)
}

/** `owner/name` → `owner`, lowercased: GitHub logins are case-insensitive. */
export function repositoryOwner(repository: string | null | undefined): string | null {
  const owner = repository?.split('/')[0]?.trim().toLowerCase()
  return owner || null
}

/**
 * A project belongs to the installation whose account owns its linked repository. A project with
 * no repository has no owner (its triage scope is instance-wide too), so it counts everywhere.
 */
export function isProjectInInstallation(
  repository: string | null | undefined,
  installationLogin: string,
): boolean {
  const owner = repositoryOwner(repository)
  return owner === null || owner === installationLogin.toLowerCase()
}

/** A filter the signal cannot answer (an older worker omits environment) does not match. */
export function matchesIssueFilters(rule: RuleFilters, signal: IssueSignal): boolean {
  if (rule.projectIds.length > 0 && !rule.projectIds.includes(signal.projectId)) return false
  if (rule.projectIds.length === 0 && !isProjectInInstallation(signal.repository, rule.login)) {
    return false
  }
  if (rule.environment && signal.environment !== rule.environment) return false
  if (rule.release && signal.release !== rule.release) return false
  return isLevelAtLeast(signal.level, rule.minLevel)
}

/** New issues and reviews are news once; everything else repeats after the action interval. */
export function isOncePerSubject(trigger: AlertTrigger | null | undefined): boolean {
  return trigger === 'new_issue' || trigger === 'review_failed' || trigger === 'blocking_review'
}

export function firingStatusOf(deliveries: AlertDeliveryRecord[]): FiringStatus {
  if (deliveries.length === 0) return 'undelivered'
  const delivered = deliveries.filter((delivery) => delivery.isDelivered).length
  if (delivered === deliveries.length) return 'delivered'
  return delivered === 0 ? 'failed' : 'partial'
}
