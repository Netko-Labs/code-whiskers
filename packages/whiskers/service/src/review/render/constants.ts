import type { LlmFinding } from '@code-whiskers/whiskers-domain'

type Severity = LlmFinding['severity']

export const SEVERITY_ORDER: readonly Severity[] = ['critical', 'high', 'medium', 'low']
export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}
export const BLOCKING_SEVERITIES: ReadonlySet<Severity> = new Set(['high', 'critical'])
export const BOT_NAME = 'CodeWhiskers'
export const MAX_TABLE_ROWS = 25
export const MAX_HIGHLIGHTS = 8
export const MAX_FAILURE_CHARS = 500
