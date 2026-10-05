/** Mirrors studio's rule vocabulary; studio owns the rules, whiskers only evaluates them. */
export const ALERT_TRIGGERS = [
  'new_issue',
  'issue_regressed',
  'issue_frequency',
  'error_rate',
  'review_failed',
  'blocking_review',
] as const
export const ALERT_LEVELS = ['debug', 'info', 'warning', 'error', 'fatal'] as const
/** Sentry SDKs also send these spellings; they rank with their canonical level. */
export const ALERT_LEVEL_ALIASES: Record<string, (typeof ALERT_LEVELS)[number]> = {
  warn: 'warning',
  critical: 'fatal',
}
