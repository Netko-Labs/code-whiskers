import { describe, expect, test } from 'bun:test'
import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import {
  type ReviewReport,
  renderFailureComment,
  renderFinding,
  renderReviewBody,
  summaryLines,
} from '../src/review/render'

const TARGET = { owner: 'acme', repo: 'api', headSha: 'deadbeef' }

const finding = (overrides: Partial<LlmFinding> = {}): LlmFinding => ({
  file: 'src/auth.ts',
  line: 12,
  severity: 'medium',
  category: 'bug',
  title: 'A finding',
  body: 'What breaks.',
  suggestion: null,
  ...overrides,
})

const report = (review: Partial<LlmReview>, reviewed = 1, total = 1): ReviewReport => ({
  review: { findings: [], summary: '', verdict: 'approve', ...review },
  model: 'openai/gpt-6-luna',
  coverage: { reviewed, total },
})

const EMOJI = /\p{Extended_Pictographic}/u

describe('renderReviewBody', () => {
  test('clean approval is a verdict, what changed, and a footer', () => {
    const body = renderReviewBody(report({ summary: 'Adds retries.' }), TARGET)
    expect(body).toBe(
      '**Approved** · no findings\n\n**What this changes**\n\n- Adds retries.\n\n<sub>CodeWhiskers · openai/gpt-6-luna</sub>',
    )
  })

  test('blocking rows come first and link to the head commit', () => {
    const body = renderReviewBody(
      report({
        verdict: 'request_changes',
        findings: [
          finding({ severity: 'medium', title: 'Slow loop' }),
          finding({ severity: 'critical', title: 'SQL injection', file: 'src/db.ts', line: 3 }),
        ],
      }),
      TARGET,
    )
    expect(body.startsWith('**Changes requested** · 1 blocking, 2 findings across 2 files')).toBe(
      true,
    )
    expect(body.indexOf('SQL injection')).toBeLessThan(body.indexOf('Slow loop'))
    expect(body).toContain(
      '[`src/db.ts:3`](https://github.com/acme/api/blob/deadbeef/src/db.ts#L3 "src/db.ts")',
    )
  })

  test('approval with findings says none are blocking', () => {
    const body = renderReviewBody(report({ findings: [finding()] }), TARGET)
    expect(body.split('\n')[0]).toBe('**Approved** · 1 finding across 1 file, none blocking')
  })

  test('a pipe or newline in a title cannot break the table', () => {
    const body = renderReviewBody(report({ findings: [finding({ title: 'a | b\nc' })] }), TARGET)
    expect(body).toContain('| a \\| b c |')
  })

  test('low-severity notes are collapsed, not in the main table', () => {
    const body = renderReviewBody(
      report({ findings: [finding({ severity: 'low', title: 'Nit' })] }),
      TARGET,
    )
    expect(body).toContain('<summary>1 low-severity note</summary>')
    expect(body.indexOf('| Severity')).toBeGreaterThan(body.indexOf('<details>'))
  })

  test('findings GitHub cannot anchor get full detail in a collapsed block', () => {
    const lost = finding({ line: null, title: 'Outside the diff', file: 'README.md' })
    const body = renderReviewBody(report({ findings: [lost] }), TARGET, [lost])
    expect(body).toContain('<summary>1 finding not on a changed line</summary>')
    expect(body).toContain(
      '[`README.md`](https://github.com/acme/api/blob/deadbeef/README.md "README.md")',
    )
    expect(body).toContain('**Medium · bug** — Outside the diff')
  })

  test('a partial review says how much was skipped', () => {
    const body = renderReviewBody(report({ summary: 'x' }, 7, 9), TARGET)
    expect(body).toContain('_2 of 9 sections could not be reviewed (provider timed out).')
  })

  test('long tables and long change lists are capped', () => {
    const many = Array.from({ length: 30 }, (_, i) => finding({ title: `F${i}` }))
    const summary = Array.from({ length: 12 }, (_, i) => `Change ${i}.`).join('\n')
    const body = renderReviewBody(report({ findings: many, summary }), TARGET)
    expect(body).toContain('Plus 5 more, inline on the diff.')
    expect(body).toContain('- Plus 4 more sections.')
  })

  test('never emits emoji', () => {
    const body = renderReviewBody(
      report({ verdict: 'request_changes', findings: [finding({ severity: 'high' })] }, 1, 2),
      TARGET,
    )
    expect(EMOJI.test(body)).toBe(false)
  })
})

test('the where column shows the last two path segments, the link keeps the full path', () => {
  const body = renderReviewBody(
    report({ findings: [finding({ file: 'packages/a/src/review/index.ts', line: 7 })] }),
    TARGET,
  )
  expect(body).toContain(
    '[`review/index.ts:7`](https://github.com/acme/api/blob/deadbeef/packages/a/src/review/index.ts#L7 "packages/a/src/review/index.ts")',
  )
})

describe('renderFinding', () => {
  test('severity and category lead, fix is its own line', () => {
    expect(renderFinding(finding({ suggestion: 'Use a parameter.' }))).toBe(
      '**Medium · bug** — A finding\n\nWhat breaks.\n\n**Fix** — Use a parameter.',
    )
  })

  test('a multi-line suggestion becomes a code block', () => {
    const text = renderFinding(finding({ suggestion: 'a()\nb()' }))
    expect(text).toContain('**Fix**\n\n```\na()\nb()\n```')
  })

  test('an empty body is dropped rather than leaving a blank paragraph', () => {
    expect(renderFinding(finding({ body: '' }))).toBe('**Medium · bug** — A finding')
  })
})

describe('summaryLines', () => {
  test('strips list markers, blanks and exact repeats', () => {
    expect(summaryLines('- Adds retries.\n\n* Adds retries.\nFixes the cache.')).toEqual([
      'Adds retries.',
      'Fixes the cache.',
    ])
  })
})

describe('renderFailureComment', () => {
  test('quotes every line of the error', () => {
    expect(renderFailureComment('abcdef123', 'one\ntwo')).toBe(
      '**Review failed** on `abcdef1`\n\n> one\n> two\n\nUsually a transient provider error. Push a commit to run the review again.',
    )
  })
})
