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
export const REACTION_HINT = '<sub>React 👎 to dismiss · 🚀 to fix · 😕 to explain</sub>'
export const FINDING_MARKER = /<!-- whiskers-finding (wf_[0-9a-f]+) round=(\d+) -->/
export const FIXED_REPLY = /^Fixed in [0-9a-f]{7,40}\./
export const LOOP_HEADLINE = {
  mergeable: 'Mergeable',
  needs_changes: 'Needs changes',
  blocked: 'Blocked',
  needs_human: 'Needs a human',
} as const
// GitHub caps a check run's `output.text` at 65535 characters.
export const MAX_CHECK_TEXT_CHARS = 60_000
