/** Issue events fire once per issue (new) or per reopening (regressed); they may be combined. */
export const ALERT_ISSUE_EVENT_TRIGGERS = ['new_issue', 'issue_regressed'] as const
export const ALERT_RATE_TRIGGERS = ['issue_frequency', 'error_rate'] as const
export const ALERT_REVIEW_TRIGGERS = ['review_failed', 'blocking_review'] as const
export const ALERT_TRIGGERS = [
  ...ALERT_ISSUE_EVENT_TRIGGERS,
  ...ALERT_RATE_TRIGGERS,
  ...ALERT_REVIEW_TRIGGERS,
] as const

export const ALERT_RULE_STATES = ['armed', 'firing', 'muted'] as const
export const ALERT_LEVELS = ['debug', 'info', 'warning', 'error', 'fatal'] as const
export const ALERT_ACTION_INTERVALS = [5, 30, 60, 180, 1440] as const
export const DEFAULT_ACTION_INTERVAL = 30
export const DEFAULT_RULE_ENVIRONMENT = 'production'

export const ALERT_SUBJECT_KINDS = ['issue', 'review', 'project'] as const
export const ALERT_FIRING_STATUSES = ['delivered', 'partial', 'failed', 'undelivered'] as const

export const MAX_RULE_PROJECTS = 20
export const MAX_RULE_DESTINATIONS = 20
export const FIRING_RETENTION_DAYS = 90
