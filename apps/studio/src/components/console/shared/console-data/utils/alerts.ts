import type { AlertRule } from '@/integrations/studio-api'
import { formatAge } from '@/shared/format-date'
import type { ConsoleItem } from '../../console-model'

export function alertCondition(rule: AlertRule): string {
  const where = rule.projectId ? ` in project ${rule.projectId}` : ''
  if (rule.kind === 'new_issue') return `A new issue${where}`
  if (rule.kind === 'error_rate') {
    return `${rule.threshold}+ errors in ${rule.windowMinutes}m${where}`
  }
  if (rule.kind === 'review_failed') return 'A review failed'
  return 'A review requested changes'
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
    projectId: rule.projectId ?? undefined,
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
