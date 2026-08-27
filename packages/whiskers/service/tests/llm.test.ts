import { describe, expect, test } from 'bun:test'
import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import { filterBySeverity, mergeReviews, resolveVerdict } from '../src/review/llm'

const finding = (severity: LlmFinding['severity']): LlmFinding => ({
  file: 'src/app.ts',
  line: 1,
  severity,
  category: 'bug',
  title: 'a finding',
  body: 'details',
  suggestion: null,
})

const review = (verdict: LlmReview['verdict'], findings: LlmFinding[] = []): LlmReview => ({
  findings,
  summary: `summary for ${verdict}`,
  verdict,
})

describe('resolveVerdict', () => {
  test('approves when there are no findings', () => {
    expect(resolveVerdict([])).toBe('approve')
  })

  test('requests changes on any high or critical finding', () => {
    expect(resolveVerdict([finding('low'), finding('high')])).toBe('request_changes')
    expect(resolveVerdict([finding('critical')])).toBe('request_changes')
  })

  test('still approves when findings are all non-blocking nitpicks', () => {
    expect(resolveVerdict([finding('low'), finding('medium')])).toBe('approve')
  })
})

describe('mergeReviews', () => {
  test('derives the verdict from merged findings, not the per-chunk verdicts', () => {
    // A chunk that hedged with "comment" despite a clean diff still approves.
    expect(mergeReviews([review('comment'), review('comment')]).verdict).toBe('approve')
    // A blocking finding in any chunk wins regardless of the chunk's own verdict.
    expect(
      mergeReviews([review('approve'), review('comment', [finding('critical')])]).verdict,
    ).toBe('request_changes')
  })

  test('concatenates findings and non-empty summaries', () => {
    const merged = mergeReviews([
      review('comment', [finding('low')]),
      { findings: [finding('medium')], summary: '', verdict: 'comment' },
    ])
    expect(merged.findings).toHaveLength(2)
    expect(merged.summary).toBe('summary for comment')
    expect(merged.verdict).toBe('approve')
  })

  test('an empty review set approves', () => {
    expect(mergeReviews([]).verdict).toBe('approve')
  })
})

describe('filterBySeverity', () => {
  const findings = [finding('low'), finding('medium'), finding('high'), finding('critical')]

  test("min 'low' keeps everything (default behavior)", () => {
    expect(filterBySeverity(findings, 'low')).toHaveLength(4)
  })

  test("min 'medium' drops the nitpick tier", () => {
    expect(filterBySeverity(findings, 'medium').map((f) => f.severity)).toEqual([
      'medium',
      'high',
      'critical',
    ])
  })

  test("min 'critical' keeps only critical", () => {
    expect(filterBySeverity(findings, 'critical').map((f) => f.severity)).toEqual(['critical'])
  })
})
