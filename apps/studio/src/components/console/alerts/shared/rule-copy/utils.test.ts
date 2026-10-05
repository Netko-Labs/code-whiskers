import { describe, expect, test } from 'bun:test'
import type { RuleShape } from './types'
import { formatMinutes, ruleSentence, toggleTrigger, whenSummary } from './utils'

const rule = (overrides: Partial<RuleShape> = {}): RuleShape => ({
  triggers: ['new_issue'],
  projectIds: [],
  environment: null,
  minLevel: null,
  release: null,
  threshold: 100,
  windowMinutes: 60,
  actionIntervalMinutes: 30,
  ...overrides,
})

describe('toggleTrigger', () => {
  test('issue events combine and never empty out', () => {
    expect(toggleTrigger(['new_issue'], 'issue_regressed')).toEqual([
      'new_issue',
      'issue_regressed',
    ])
    expect(toggleTrigger(['new_issue', 'issue_regressed'], 'new_issue')).toEqual([
      'issue_regressed',
    ])
    expect(toggleTrigger(['new_issue'], 'new_issue')).toEqual(['new_issue'])
  })

  test('a rate or review trigger replaces the selection, and an event replaces it back', () => {
    expect(toggleTrigger(['new_issue', 'issue_regressed'], 'error_rate')).toEqual(['error_rate'])
    expect(toggleTrigger(['error_rate'], 'new_issue')).toEqual(['new_issue'])
  })
})

describe('whenSummary', () => {
  test('events with their filters', () => {
    expect(
      whenSummary(
        rule({
          triggers: ['new_issue', 'issue_regressed'],
          environment: 'production',
          minLevel: 'error',
        }),
      ),
    ).toBe('new | regressed · production · ≥error')
  })

  test('rate triggers carry the threshold over the window', () => {
    expect(whenSummary(rule({ triggers: ['issue_frequency'] }))).toBe('issue ≥100/1h')
    expect(whenSummary(rule({ triggers: ['error_rate'], windowMinutes: 5 }))).toBe(
      'project ≥100/5m',
    )
  })
})

describe('ruleSentence', () => {
  test('a new-issue rule is news once per issue', () => {
    expect(ruleSentence(rule({ environment: 'production' }), ['shop'], 'all')).toBe(
      'When a new issue appears in shop · production, notify every destination once per issue.',
    )
  })

  test('a spike throttles per issue and names the destinations', () => {
    expect(ruleSentence(rule({ triggers: ['issue_frequency'] }), [], ['#oncall', 'Discord'])).toBe(
      'When an issue gets 100+ events in 1 hour in any project, notify #oncall and Discord at most once per issue every 30 minutes.',
    )
  })

  test('reviews skip the event filters', () => {
    expect(ruleSentence(rule({ triggers: ['review_failed'] }), [], [])).toBe(
      'When a review fails, notify nobody yet once per review.',
    )
  })
})

test('formatMinutes', () => {
  expect([5, 60, 90, 1440].map(formatMinutes)).toEqual(['5m', '1h', '90m', '24h'])
})
