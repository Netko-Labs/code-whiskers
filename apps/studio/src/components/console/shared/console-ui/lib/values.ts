import type { ConsoleSeverity, ConsoleTone, LogLevel, PillTone } from '../../console-model'

export const TONE_TEXT: Record<ConsoleTone, string> = {
  default: 'text-foreground',
  body: 'text-body',
  muted: 'text-muted-foreground',
  faint: 'text-faint',
  bad: 'text-severity-error-ink',
  warn: 'text-severity-warning-ink',
  ok: 'text-severity-resolved-ink',
  info: 'text-severity-info-ink',
}

export const SEVERITY_BG: Record<ConsoleSeverity, string> = {
  critical: 'bg-severity-error',
  warning: 'bg-severity-warning',
  info: 'bg-severity-info',
  ok: 'bg-severity-resolved',
  idle: 'bg-faint',
}

export const SEVERITY_TEXT: Record<ConsoleSeverity, string> = {
  critical: 'text-severity-error',
  warning: 'text-severity-warning',
  info: 'text-severity-info',
  ok: 'text-severity-resolved',
  idle: 'text-muted-foreground',
}

export const PILL_TONE: Record<PillTone, string> = {
  ok: 'text-severity-resolved-ink bg-severity-resolved/10',
  warn: 'text-severity-warning-ink bg-severity-warning/10',
  bad: 'text-severity-error-ink bg-severity-error/10',
  info: 'text-severity-info-ink bg-severity-info/10',
  neutral: 'text-body bg-muted',
}

export const BAR_TONE: Record<PillTone, string> = {
  ok: 'bg-severity-resolved',
  warn: 'bg-severity-warning',
  bad: 'bg-severity-error',
  info: 'bg-severity-info',
  neutral: 'bg-rule-strong',
}

/** Log panes carry `dark`, so these resolve to the dark-ground severity column in both themes. */
export const LOG_LEVEL_TEXT: Record<LogLevel, string> = {
  ERROR: 'text-severity-error',
  WARN: 'text-severity-warning',
  INFO: 'text-zinc-600',
  OK: 'text-severity-resolved',
}

export const STACK_TONE = {
  strong: 'text-zinc-50',
  dim: 'text-zinc-500',
  muted: 'text-zinc-400',
} as const
