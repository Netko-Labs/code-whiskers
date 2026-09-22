import { describe, expect, test } from 'bun:test'
import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import { buildCheckOutput } from '../src/review/github'
import type { ReviewReport } from '../src/review/render'

const TARGET = { owner: 'o', repo: 'r', headSha: 'abc1234' }
const report = (review: LlmReview): ReviewReport => ({
  review,
  model: 'test/model',
  coverage: { reviewed: 1, total: 1 },
})

const finding = (severity: LlmFinding['severity'], line: number | null = 10): LlmFinding => ({
  file: 'src/app.ts',
  line,
  severity,
  category: 'bug',
  title: 'a finding',
  body: 'details',
  suggestion: null,
})

describe('buildCheckOutput', () => {
  test('clean approval', () => {
    const output = buildCheckOutput(
      report({ findings: [], summary: 'All good.', verdict: 'approve' }),
      TARGET,
    )
    expect(output.title).toBe('Approved — no findings')
    expect(output.summary).toContain('- All good.')
    expect(output.annotations).toEqual([])
  })

  test('request_changes with severity breakdown and annotation levels', () => {
    const output = buildCheckOutput(
      report({
        findings: [finding('critical'), finding('high'), finding('low')],
        summary: 'Blocking issues.',
        verdict: 'request_changes',
      }),
      TARGET,
    )
    expect(output.title).toBe('Changes requested — 1 critical, 1 high, 1 low')
    expect(output.annotations.map((a) => a.annotation_level)).toEqual([
      'failure',
      'failure',
      'notice',
    ])
    expect(output.annotations[0]?.start_line).toBe(10)
  })

  test('findings without a line are excluded from annotations', () => {
    const output = buildCheckOutput(
      report({
        findings: [finding('medium', null), finding('medium')],
        summary: 's',
        verdict: 'approve',
      }),
      TARGET,
    )
    expect(output.annotations).toHaveLength(1)
  })
})
