import type { Tone } from './types'

export const TONE_DOT: Record<Tone, string> = {
  error: 'bg-severity-error',
  warning: 'bg-severity-warning',
  resolved: 'bg-severity-resolved',
  info: 'bg-severity-info',
  neutral: 'bg-rule-strong',
}

/** Severity text needs more contrast than a dot; neutral text is simply muted. */
export const TONE_INK: Record<Tone, string> = {
  error: 'text-severity-error-ink',
  warning: 'text-severity-warning-ink',
  resolved: 'text-severity-resolved-ink',
  info: 'text-severity-info-ink',
  neutral: 'text-muted-foreground',
}

/** The 1px left rule a row carries instead of a filled background. */
export const TONE_RULE: Record<Tone, string> = {
  error: 'before:bg-severity-error',
  warning: 'before:bg-severity-warning',
  resolved: 'before:bg-severity-resolved',
  info: 'before:bg-severity-info',
  neutral: 'before:bg-transparent',
}

export const TONE_STROKE: Record<Tone, string> = {
  error: 'text-severity-error',
  warning: 'text-severity-warning',
  resolved: 'text-severity-resolved',
  info: 'text-severity-info',
  neutral: 'text-muted-foreground',
}
