import type { Organization, ReviewRule } from '@/integrations/studio-api'
import type { RuleDraft, RuleTab } from './types'
import { BODY_MAX, BODY_MIN, EVERYWHERE, SCOPE_MAX } from './values'

export function newDraft(
  organizations: Organization[],
  seed: Partial<Omit<RuleDraft, 'id'>> = {},
): RuleDraft {
  return {
    body: '',
    scope: EVERYWHERE,
    effect: 'suggestion',
    installationId: String(organizations[0]?.installationId ?? ''),
    ...seed,
  }
}

export function draftOf(rule: ReviewRule): RuleDraft {
  return {
    id: rule.id,
    body: rule.body,
    scope: rule.scope,
    effect: rule.effect,
    installationId: String(rule.installationId),
  }
}

/** The same limits studio's schema enforces, said before the round trip. */
export function draftError(draft: RuleDraft): string | null {
  const body = draft.body.trim()
  if (body.length < BODY_MIN) return 'Write the rule as a sentence or two'
  if (body.length > BODY_MAX) return `Keep the rule under ${BODY_MAX.toLocaleString()} characters`
  if (draft.scope.trim().length > SCOPE_MAX) return `Keep the path under ${SCOPE_MAX} characters`
  if (!draft.id && !draft.installationId) return 'Pick the installation the rule belongs to'
  return null
}

export function isOnRuleTab(rule: ReviewRule, tab: RuleTab): boolean {
  if (tab === 'active') return !rule.isMuted
  if (tab === 'muted') return rule.isMuted
  return true
}

/** Blockers first, then the rest by effect; muted rules sink. */
export function sortRules(rules: ReviewRule[]): ReviewRule[] {
  const rank = { blocker: 0, suggestion: 1, filter: 2, tone: 3 }
  return [...rules].sort(
    (a, b) =>
      Number(a.isMuted) - Number(b.isMuted) ||
      rank[a.effect] - rank[b.effect] ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  )
}
