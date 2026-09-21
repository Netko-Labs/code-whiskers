import { describe, expect, test } from 'bun:test'
import type { Finding } from '@code-whiskers/whiskers-domain'
import { buildPrContext } from './context'
import type { PrConversation } from './github'

const EMPTY: PrConversation = { verdicts: [], discussion: [], inline: [] }

const finding = (over: Partial<Finding> = {}): Finding =>
  ({
    id: 'f1',
    reviewId: 'r1',
    file: 'src/a.ts',
    line: 12,
    severity: 'high',
    category: 'bug',
    title: 'Unbounded retry',
    body: '',
    suggestion: null,
    createdAt: new Date(),
    ...over,
  }) as Finding

describe('buildPrContext', () => {
  test('a first review with no conversation carries no preamble', () => {
    expect(buildPrContext({ reviewCount: 0, conversation: EMPTY, botHandle: 'cw' })).toBe('')
  })

  test('reports prior findings and the last verdict', () => {
    const out = buildPrContext({
      reviewCount: 2,
      previous: { headSha: 'a1f09c2abc', verdict: 'request_changes', findings: [finding()] },
      conversation: EMPTY,
      botHandle: 'cw',
    })
    expect(out).toContain('Reviewed 2 times before')
    expect(out).toContain('request_changes on a1f09c2')
    expect(out).toContain('- src/a.ts:12 [high] Unbounded retry')
  })

  test('keeps human comments and drops the bot its own', () => {
    const out = buildPrContext({
      reviewCount: 1,
      conversation: {
        verdicts: [
          { author: 'ada', state: 'CHANGES_REQUESTED', body: 'needs a test' },
          { author: 'cw[bot]', state: 'COMMENTED', body: 'I found 3 things' },
        ],
        discussion: [{ author: 'cw[bot]', body: 'beep' }],
        inline: [{ author: 'juan', path: 'src/b.ts', line: 44, body: 'use parseCursor' }],
      },
      botHandle: 'cw',
    })
    expect(out).toContain('ada (requested changes): needs a test')
    expect(out).toContain('juan on src/b.ts:44: use parseCursor')
    expect(out).not.toContain('I found 3 things')
    expect(out).not.toContain('beep')
  })

  test('flattens code fences and clips long bodies', () => {
    const out = buildPrContext({
      reviewCount: 1,
      conversation: {
        ...EMPTY,
        discussion: [
          { author: 'ada', body: `look:\n\`\`\`ts\nconst x = 1\n\`\`\`\n${'y'.repeat(400)}` },
        ],
      },
      botHandle: 'cw',
    })
    expect(out).toContain('[code]')
    expect(out).toContain('…')
    expect(out).not.toContain('const x = 1')
    expect(out.split('\n').every((l) => l.length < 260)).toBe(true)
  })

  test('stays inside its budget when the PR is enormous', () => {
    const findings = Array.from({ length: 40 }, (_, i) =>
      finding({ id: `f${i}`, file: `src/file-${i}.ts`, title: `Finding number ${i} `.repeat(4) }),
    )
    const inline = Array.from({ length: 40 }, (_, i) => ({
      author: `dev${i}`,
      path: `src/x-${i}.ts`,
      line: i,
      body: 'please change this thing '.repeat(8),
    }))
    const out = buildPrContext({
      reviewCount: 9,
      previous: { headSha: 'deadbeefcafe', verdict: 'approve', findings },
      conversation: { ...EMPTY, inline },
      botHandle: 'cw',
    })
    expect(out.length).toBeLessThan(2_400)
    expect(out).toContain('and 3')
  })
})
