import type { Tone } from '@/components/shared/status'
import type { AlertFiringStatus, AlertLevel, AlertTrigger } from '@/integrations/alerts-api'
import type { RuleTemplate, StateCopy, TriggerCopy, TriggerGroup } from './types'

export const TRIGGER_COPY: Record<AlertTrigger, TriggerCopy> = {
  new_issue: {
    label: 'A new issue appears',
    description: 'The first event of a fingerprint never seen before.',
    short: 'new',
    subject: 'issue',
  },
  issue_regressed: {
    label: 'An issue regresses',
    description: 'A resolved issue receives an event again. Alerts the moment ingest sees it.',
    short: 'regressed',
    subject: 'issue',
  },
  issue_frequency: {
    label: 'An issue spikes',
    description: 'One issue receives at least N events within the window.',
    short: 'issue',
    subject: 'issue',
  },
  error_rate: {
    label: 'A project gets noisy',
    description: 'All matching events across a project reach N within the window.',
    short: 'project',
    subject: 'project',
  },
  review_failed: {
    label: 'A review fails',
    description: 'The reviewer could not finish a pull request.',
    short: 'review failed',
    subject: 'review',
  },
  blocking_review: {
    label: 'A review blocks a pull request',
    description: 'The reviewer requested changes.',
    short: 'review blocks',
    subject: 'review',
  },
}

export const TRIGGER_GROUPS: TriggerGroup[] = [
  { label: 'Issue events', isCombinable: true, triggers: ['new_issue', 'issue_regressed'] },
  { label: 'Volume', isCombinable: false, triggers: ['issue_frequency', 'error_rate'] },
  { label: 'Code review', isCombinable: false, triggers: ['review_failed', 'blocking_review'] },
]

export const RATE_TRIGGERS: AlertTrigger[] = ['issue_frequency', 'error_rate']
export const REVIEW_TRIGGERS: AlertTrigger[] = ['review_failed', 'blocking_review']
export const ISSUE_EVENT_TRIGGERS: AlertTrigger[] = ['new_issue', 'issue_regressed']

export const LEVEL_OPTIONS: { value: AlertLevel | ''; label: string }[] = [
  { value: '', label: 'Any level' },
  { value: 'info', label: 'Info and above' },
  { value: 'warning', label: 'Warning and above' },
  { value: 'error', label: 'Error and above' },
  { value: 'fatal', label: 'Fatal only' },
]

export const INTERVAL_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: '5m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 180, label: '3h' },
  { value: 1440, label: '24h' },
]

export const ENVIRONMENT_SUGGESTIONS = ['production', 'staging', 'development']

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    key: 'new-issues',
    title: 'Notify on new issues',
    description: 'Every new issue in production, once.',
    name: 'New issues in production',
    triggers: ['new_issue'],
    threshold: 1,
    windowMinutes: 5,
    actionIntervalMinutes: 30,
    environment: 'production',
  },
  {
    key: 'spike',
    title: 'Spike over 100/h',
    description: 'One issue passes 100 events in an hour.',
    name: 'Issue spike',
    triggers: ['issue_frequency'],
    threshold: 100,
    windowMinutes: 60,
    actionIntervalMinutes: 60,
    environment: null,
  },
  {
    key: 'regressions',
    title: 'Regressions',
    description: 'A resolved issue comes back.',
    name: 'Regressions',
    triggers: ['issue_regressed'],
    threshold: 1,
    windowMinutes: 5,
    actionIntervalMinutes: 30,
    environment: null,
  },
]

export const STATE_COPY: Record<'armed' | 'firing' | 'muted', StateCopy> = {
  armed: { label: 'Armed', tone: 'neutral' },
  firing: { label: 'Firing', tone: 'error' },
  muted: { label: 'Muted', tone: 'neutral' },
}

export const FIRING_TONE: Record<AlertFiringStatus, Tone> = {
  delivered: 'info',
  partial: 'warning',
  failed: 'error',
  undelivered: 'warning',
}

export const FIRING_STATUS_LABEL: Record<AlertFiringStatus, string> = {
  delivered: 'Delivered',
  partial: 'Partly delivered',
  failed: 'Not delivered',
  undelivered: 'No destination',
}
