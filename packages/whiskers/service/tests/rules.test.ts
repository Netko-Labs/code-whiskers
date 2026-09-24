import { describe, expect, test } from 'bun:test'
import { buildRulesContext, type ReviewRule } from '../src/review/rules'

const rule = (overrides: Partial<ReviewRule> = {}): ReviewRule => ({
  body: 'Money is integer cents, never floats',
  scope: 'src/billing/**',
  effect: 'blocker',
  ...overrides,
})

describe('buildRulesContext', () => {
  test('no rules, no block', () => {
    expect(buildRulesContext([])).toBe('')
  })

  test('each rule says its effect, where it applies, and what the effect means', () => {
    const text = buildRulesContext([
      rule(),
      rule({ scope: '**', effect: 'filter', body: 'Ignore docs' }),
    ])
    expect(text).toContain(
      '(blocker, in src/billing/**; a violation is a high-severity finding) Money is integer cents',
    )
    expect(text).toContain('(filter, everywhere; never report this) Ignore docs')
  })

  test('past the budget, rules are counted rather than silently lost', () => {
    const many = Array.from({ length: 40 }, (_, i) => rule({ body: `Rule number ${i} `.repeat(4) }))
    const text = buildRulesContext(many)
    expect(text).toMatch(/…\d+ more rules did not fit/)
    expect(text.length).toBeLessThan(1_700)
  })
})
