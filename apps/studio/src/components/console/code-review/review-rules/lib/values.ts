import type { ReviewRuleEffect } from '@/integrations/studio-api'
import type { EffectMeta, RuleTab } from './types'

export const EFFECT_META: Record<ReviewRuleEffect, EffectMeta> = {
  blocker: {
    label: 'Blocker',
    hint: 'A violation is high severity and requests changes',
    tone: 'error',
  },
  suggestion: { label: 'Suggestion', hint: 'Raise it, never block on it', tone: 'warning' },
  filter: { label: 'Filter', hint: 'Never report this kind of finding', tone: 'neutral' },
  tone: { label: 'Tone', hint: 'How findings should read', tone: 'info' },
}

export const EFFECT_ORDER: ReviewRuleEffect[] = ['blocker', 'suggestion', 'filter', 'tone']

export const RULE_TABS: { key: RuleTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'muted', label: 'Muted' },
]

export const EVERYWHERE = '**'

export const EXAMPLE_RULE = {
  body: 'Money is integer cents. Flag any float arithmetic on amounts, prices or totals.',
  scope: 'src/billing/**',
  effect: 'blocker',
} as const

export const BODY_MIN = 3
export const BODY_MAX = 1_000
export const SCOPE_MAX = 200
