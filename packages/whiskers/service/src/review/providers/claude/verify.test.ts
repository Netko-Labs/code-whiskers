import { describe, expect, test } from 'bun:test'
import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import { applyVerdicts, verifyPrompt } from './verify'

const finding = (title: string, severity: LlmFinding['severity'] = 'medium'): LlmFinding => ({
  file: 'src/a.ts',
  line: 3,
  severity,
  category: 'bug',
  title,
  body: '',
  suggestion: null,
  evidence: 'const a = 1',
})

const review = (findings: LlmFinding[]): LlmReview => ({
  findings,
  summary: 'Adds a.',
  verdict: 'request_changes',
})

describe('applyVerdicts', () => {
  test('drops what the checker rejects and takes its severity', () => {
    const out = applyVerdicts(review([finding('real', 'high'), finding('noise', 'high')]), {
      verdicts: [
        { index: 0, keep: true, severity: 'medium', reason: '' },
        { index: 1, keep: false, severity: 'low', reason: 'handled' },
      ],
    })
    expect(out.findings.map((f) => [f.title, f.severity])).toEqual([['real', 'medium']])
    expect(out.verdict).toBe('approve')
  })

  test('keeps a finding the checker never ruled on', () => {
    const out = applyVerdicts(review([finding('a'), finding('b', 'critical')]), {
      verdicts: [{ index: 0, keep: false, severity: 'low', reason: '' }],
    })
    expect(out.findings.map((f) => f.title)).toEqual(['b'])
    expect(out.verdict).toBe('request_changes')
  })
})

describe('verifyPrompt', () => {
  test('carries the team context, the diff and indexed claims', () => {
    const text = verifyPrompt('+const a = 1', '## Team memory\n- Never flag a', [finding('x')])
    expect(text.startsWith('## Team memory')).toBe(true)
    expect(text).toContain('+const a = 1')
    expect(text).toContain('"index": 0')
  })
})
