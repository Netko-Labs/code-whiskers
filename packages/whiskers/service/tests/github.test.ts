import { describe, expect, test } from 'bun:test'
import type { LlmFinding, LlmReview, ReviewContract } from '@code-whiskers/whiskers-domain'
import { buildCheckOutput } from '../src/review/check-run'
import type { ReviewReport } from '../src/review/render'

const TARGET = { owner: 'o', repo: 'r', headSha: 'abc1234' }
const report = (review: LlmReview): ReviewReport => ({
  review,
  model: 'test/model',
  coverage: { reviewed: 1, total: 1 },
})
const contract = (patch: Partial<ReviewContract> = {}): ReviewContract => ({
  pr: 'o/r#1',
  head: 'abc1234',
  round: 1,
  verdict: 'mergeable',
  blockers: [],
  suggestions: [],
  fixed_since_last_round: [],
  ...patch,
})

const finding = (severity: LlmFinding['severity'], line: number | null = 10): LlmFinding => ({
  file: 'src/app.ts',
  line,
  severity,
  category: 'bug',
  title: 'a finding',
  body: 'details',
  suggestion: null,
  evidence: '',
})

describe('buildCheckOutput', () => {
  test('clean approval', () => {
    const output = buildCheckOutput(
      report({ findings: [], summary: 'All good.', verdict: 'approve' }),
      TARGET,
      contract(),
    )
    expect(output.title).toBe('Mergeable — round 1 · no findings')
    expect(output.summary).toContain('- All good.')
    expect(output.annotations).toEqual([])
  })

  test('the loop verdict leads the title, with the severity breakdown', () => {
    const output = buildCheckOutput(
      report({
        findings: [finding('critical'), finding('high'), finding('low')],
        summary: 'Blocking issues.',
        verdict: 'request_changes',
      }),
      TARGET,
      contract({ verdict: 'blocked', round: 2, fixed_since_last_round: ['wf_19ab00'] }),
    )
    expect(output.title).toBe('Blocked — round 2 · 1 critical, 1 high, 1 low')
    expect(output.summary).toStartWith(
      '**Blocked** (`blocked`) · round 2 · 0 open blockers · 1 fixed since last round',
    )
    expect(output.annotations.map((a) => a.annotation_level)).toEqual([
      'failure',
      'failure',
      'notice',
    ])
    expect(output.annotations[0]?.start_line).toBe(10)
  })

  test('the contract rides in text as a fenced JSON block', () => {
    const sent = contract({ verdict: 'needs_changes' })
    const output = buildCheckOutput(
      report({ findings: [], summary: 's', verdict: 'request_changes' }),
      TARGET,
      sent,
    )
    const json = output.text?.match(/```json\n([\s\S]+)\n```/)?.[1]
    expect(JSON.parse(json ?? 'null')).toEqual(sent)
  })

  test('findings without a line are excluded from annotations', () => {
    const output = buildCheckOutput(
      report({
        findings: [finding('medium', null), finding('medium')],
        summary: 's',
        verdict: 'approve',
      }),
      TARGET,
      contract(),
    )
    expect(output.annotations).toHaveLength(1)
  })
})
