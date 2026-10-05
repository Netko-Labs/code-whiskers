import type { AlertRule, AlertRuleInput } from '@/integrations/alerts-api'
import {
  RULE_TEMPLATES,
  type RuleShape,
  type RuleTemplateKey,
  toggleTrigger,
} from '../../shared/rule-copy'
import type { DraftAction, RuleDraft, RuleEditorSearch, RuleEditorSearchInput } from './types'
import { EMPTY_DRAFT, MAX_THRESHOLD, MAX_WINDOW_MINUTES } from './values'

function toggled(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function draftReducer(draft: RuleDraft, action: DraftAction): RuleDraft {
  switch (action.kind) {
    case 'set':
      return { ...draft, ...action.patch }
    case 'toggle-trigger':
      return { ...draft, triggers: toggleTrigger(draft.triggers, action.trigger) }
    case 'toggle-project':
      return { ...draft, projectIds: toggled(draft.projectIds, action.projectId) }
    case 'toggle-destination':
      return { ...draft, destinationIds: toggled(draft.destinationIds, action.destinationId) }
  }
}

export function draftFromRule(rule: AlertRule): RuleDraft {
  return {
    installationId: rule.installationId,
    name: rule.name,
    triggers: rule.triggers,
    projectIds: rule.projectIds,
    environment: rule.environment ?? '',
    minLevel: rule.minLevel,
    release: rule.release ?? '',
    threshold: rule.threshold,
    windowMinutes: rule.windowMinutes,
    notifyAll: rule.notifyAll,
    destinationIds: rule.destinationIds,
    actionIntervalMinutes: rule.actionIntervalMinutes,
  }
}

export function draftFromTemplate(key: RuleTemplateKey | undefined): RuleDraft {
  const template = RULE_TEMPLATES.find((candidate) => candidate.key === key)
  if (!template) return EMPTY_DRAFT
  return {
    ...EMPTY_DRAFT,
    name: template.name,
    triggers: template.triggers,
    threshold: template.threshold,
    windowMinutes: template.windowMinutes,
    actionIntervalMinutes: template.actionIntervalMinutes,
    environment: template.environment ?? '',
  }
}

/** The one thing stopping a save, in words; null when the draft is ready. */
export function draftProblem(draft: RuleDraft): string | null {
  if (!draft.name.trim()) return 'Name the rule'
  if (draft.installationId === null) return 'Pick an installation'
  if (draft.triggers.length === 0) return 'Choose what triggers it'
  if (
    !Number.isInteger(draft.threshold) ||
    draft.threshold < 1 ||
    draft.threshold > MAX_THRESHOLD
  ) {
    return 'The threshold is a whole number of at least 1'
  }
  if (
    !Number.isInteger(draft.windowMinutes) ||
    draft.windowMinutes < 1 ||
    draft.windowMinutes > MAX_WINDOW_MINUTES
  ) {
    return 'The window is 1 to 1440 minutes'
  }
  if (!draft.notifyAll && draft.destinationIds.length === 0) return 'Pick at least one destination'
  return null
}

/** The API shape, or null while the draft cannot be saved (or previewed). */
export function inputFromDraft(draft: RuleDraft): AlertRuleInput | null {
  if (draftProblem({ ...draft, name: draft.name || 'Preview' }) || draft.installationId === null) {
    return null
  }
  return {
    installationId: draft.installationId,
    name: draft.name.trim(),
    triggers: draft.triggers,
    projectIds: draft.projectIds,
    environment: draft.environment.trim() || null,
    minLevel: draft.minLevel,
    release: draft.release.trim() || null,
    threshold: draft.threshold,
    windowMinutes: draft.windowMinutes,
    notifyAll: draft.notifyAll,
    destinationIds: draft.notifyAll ? [] : draft.destinationIds,
    actionIntervalMinutes: draft.actionIntervalMinutes,
  }
}

/** Only the condition decides the preview: renaming or re-routing a rule does not recount. */
export function previewInputOf(draft: RuleDraft): AlertRuleInput | null {
  const input = inputFromDraft({ ...draft, notifyAll: true })
  return input && { ...input, name: '', destinationIds: [], notifyAll: true }
}

export function isSameDraft(a: RuleDraft, b: RuleDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** What the copy reads: blank text filters mean "any". */
export function shapeOfDraft(draft: RuleDraft): RuleShape {
  return {
    ...draft,
    environment: draft.environment.trim() || null,
    release: draft.release.trim() || null,
  }
}

export function parseRuleEditorSearch(search: RuleEditorSearchInput): RuleEditorSearch {
  const template = RULE_TEMPLATES.find((candidate) => candidate.key === search.template)
  return template ? { template: template.key } : {}
}
