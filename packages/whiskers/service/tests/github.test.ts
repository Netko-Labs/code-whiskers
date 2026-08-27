import { describe, expect, test } from 'bun:test'
import type { LlmFinding } from '@code-whiskers/whiskers-domain'
import { buildCheckOutput } from '../src/review/github'

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
    const output = buildCheckOutput({ findings: [], summary: 'All good.', verdict: 'approve' })
    expect(output.title).toBe('Approved — no findings')
    expect(output.summary).toBe('All good.')
    expect(output.annotations).toEqual([])
  })

  test('request_changes with severity breakdown and annotation levels', () => {
    const output = buildCheckOutput({
      findings: [finding('critical'), finding('high'), finding('low')],
      summary: 'Blocking issues.',
      verdict: 'request_changes',
    })
    expect(output.title).toBe('Changes requested — 1 critical, 1 high, 1 low')
    expect(output.annotations.map((a) => a.annotation_level)).toEqual([
      'failure',
      'failure',
      'notice',
    ])
    expect(output.annotations[0]?.start_line).toBe(10)
  })

  test('findings without a line are excluded from annotations', () => {
    const output = buildCheckOutput({
      findings: [finding('medium', null), finding('medium')],
      summary: 's',
      verdict: 'approve',
    })
    expect(output.annotations).toHaveLength(1)
  })
})
