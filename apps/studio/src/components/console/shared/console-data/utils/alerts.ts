import type { AlertRule } from '@/integrations/alerts-api'
import { formatAge } from '@/shared/format-date'
import { whenSummary } from '../../../alerts/shared/rule-copy'
import type { ConsoleItem } from '../../console-model'

/** The rule's WHEN line, the same mono shorthand the alerts list shows. */
export function alertCondition(rule: AlertRule): string {
  return whenSummary(rule)
}

/** A firing rule is an inbox item until it calms down or someone mutes it. */
export function alertToConsoleItem(rule: AlertRule): ConsoleItem {
  const at = rule.lastFiredAt ?? rule.lastEvaluatedAt ?? rule.createdAt
  const condition = alertCondition(rule)
  return {
    id: `alert:${rule.id}`,
    handle: 'alert',
    triage: null,
    sourceId: rule.id,
    at,
    kind: 'alert',
    repository: null,
    projectId: rule.projectIds[0],
    scopeLabel: rule.organization,
    label: 'Alert firing',
    severity: 'critical',
    age: formatAge(at),
    title: rule.name,
    subtitle: condition,
    meta: `fired ${formatAge(at)} ago`,
    badge: 'FIRING',
    badge2: '',
    confidence: 'alert rule',
    read: `${condition} — the condition held at the last check.`,
    alert: rule,
  }
}
