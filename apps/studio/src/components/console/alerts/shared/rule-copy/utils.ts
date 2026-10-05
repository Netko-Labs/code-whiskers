import type { AlertTrigger } from '@/integrations/alerts-api'
import type { RuleShape } from './types'
import { ISSUE_EVENT_TRIGGERS, RATE_TRIGGERS, TRIGGER_COPY } from './values'

/** `5m`, `1h`, `90m`, `24h`. */
export function formatMinutes(minutes: number): string {
  return minutes >= 60 && minutes % 60 === 0 ? `${minutes / 60}h` : `${minutes}m`
}

/** `5 minutes`, `1 hour`, `3 hours`. */
export function spellMinutes(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

/** Issue events combine with each other; anything else replaces the whole selection. */
export function toggleTrigger(current: AlertTrigger[], trigger: AlertTrigger): AlertTrigger[] {
  if (!ISSUE_EVENT_TRIGGERS.includes(trigger)) return [trigger]
  const events = current.filter((candidate) => ISSUE_EVENT_TRIGGERS.includes(candidate))
  if (!events.includes(trigger)) return [...events, trigger]
  const rest = events.filter((candidate) => candidate !== trigger)
  return rest.length > 0 ? rest : events
}

export function isRateRule(triggers: AlertTrigger[]): boolean {
  return triggers.some((trigger) => RATE_TRIGGERS.includes(trigger))
}

export function subjectOf(triggers: AlertTrigger[]): 'issue' | 'project' | 'review' {
  const first = triggers[0]
  return first ? TRIGGER_COPY[first].subject : 'issue'
}

function triggerShort(rule: RuleShape, trigger: AlertTrigger): string {
  const copy = TRIGGER_COPY[trigger]
  if (!RATE_TRIGGERS.includes(trigger)) return copy.short
  return `${copy.short} ≥${rule.threshold.toLocaleString('en-US')}/${formatMinutes(rule.windowMinutes)}`
}

/** The rule list's mono WHEN line: `new | regressed · production · ≥error`. */
export function whenSummary(rule: RuleShape): string {
  const when = rule.triggers.map((trigger) => triggerShort(rule, trigger)).join(' | ')
  const filters = [
    rule.environment,
    rule.minLevel && `≥${rule.minLevel}`,
    rule.release && `release ${rule.release}`,
  ].filter(Boolean)
  return [when, ...filters].join(' · ')
}

function listed(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}

function whenClause(rule: RuleShape): string {
  return rule.triggers
    .map((trigger) => {
      const label = TRIGGER_COPY[trigger].label
      if (!RATE_TRIGGERS.includes(trigger)) return label.charAt(0).toLowerCase() + label.slice(1)
      const noun = trigger === 'error_rate' ? 'a project' : 'an issue'
      return `${noun} gets ${rule.threshold.toLocaleString('en-US')}+ events in ${spellMinutes(rule.windowMinutes)}`
    })
    .join(' or ')
}

/**
 * The editor's live sentence: "When a new issue appears in shop · production · error and above,
 * notify #oncall at most once per issue every 30 minutes."
 */
export function ruleSentence(
  rule: RuleShape,
  projectNames: string[],
  destinations: string[] | 'all',
): string {
  const where = [
    projectNames.length > 0 ? `in ${listed(projectNames)}` : 'in any project',
    rule.environment,
    rule.minLevel && `${rule.minLevel} and above`,
    rule.release && `release ${rule.release}`,
  ].filter(Boolean)
  const scope = rule.triggers.some((trigger) => TRIGGER_COPY[trigger].subject === 'review')
    ? projectNames.length > 0
      ? ` on ${listed(projectNames)}'s repositories`
      : ''
    : ` ${where.join(' · ')}`
  const who =
    destinations === 'all'
      ? 'every destination'
      : destinations.length > 0
        ? listed(destinations)
        : 'nobody yet'
  const subject = subjectOf(rule.triggers)
  const throttle =
    subject === 'review' || rule.triggers.every((trigger) => trigger === 'new_issue')
      ? `once per ${subject}`
      : `at most once per ${subject} every ${spellMinutes(rule.actionIntervalMinutes)}`
  return `When ${whenClause(rule)}${scope}, notify ${who} ${throttle}.`
}
