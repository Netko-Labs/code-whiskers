import type { ConsoleSeverity, ConsoleTone, LogLevel, PillTone } from '../../console-model'

export const TONE_TEXT: Record<ConsoleTone, string> = {
  default: 'text-foreground',
  body: 'text-body',
  muted: 'text-muted-foreground',
  faint: 'text-faint',
  bad: 'text-sev-critical-ink',
  warn: 'text-sev-warning-ink',
  ok: 'text-sev-ok-ink',
  info: 'text-sev-info-ink',
}

export const SEVERITY_BG: Record<ConsoleSeverity, string> = {
  critical: 'bg-sev-critical',
  warning: 'bg-sev-warning',
  info: 'bg-sev-info',
  ok: 'bg-sev-ok',
  idle: 'bg-faint',
}

export const SEVERITY_TEXT: Record<ConsoleSeverity, string> = {
  critical: 'text-sev-critical',
  warning: 'text-sev-warning',
  info: 'text-sev-info',
  ok: 'text-sev-ok',
  idle: 'text-muted-foreground',
}

export const PILL_TONE: Record<PillTone, string> = {
  ok: 'text-sev-ok-ink bg-sev-ok/10',
  warn: 'text-sev-warning-ink bg-sev-warning/10',
  bad: 'text-sev-critical-ink bg-sev-critical/10',
  info: 'text-sev-info-ink bg-sev-info/10',
  neutral: 'text-body bg-muted',
}

export const BAR_TONE: Record<PillTone, string> = {
  ok: 'bg-sev-ok',
  warn: 'bg-sev-warning',
  bad: 'bg-sev-critical',
  info: 'bg-sev-info',
  neutral: 'bg-rule-strong',
}

/** Log panes always render on the ink ground, so these are fixed rather than themed. */
export const LOG_LEVEL_TEXT: Record<LogLevel, string> = {
  ERROR: 'text-sev-critical',
  WARN: 'text-sev-warning',
  INFO: 'text-zinc-600',
  OK: 'text-sev-ok',
}

export const STACK_TONE = {
  strong: 'text-zinc-50',
  dim: 'text-zinc-500',
  muted: 'text-zinc-400',
} as const
