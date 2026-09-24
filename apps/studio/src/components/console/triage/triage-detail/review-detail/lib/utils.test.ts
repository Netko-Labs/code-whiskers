import { describe, expect, test } from 'bun:test'
import type { WhiskersFinding, WhiskersReview } from '@/integrations/whiskers'
import { groupByFile, readBullets, reviewOutcome } from './utils'

function finding(
  file: string,
  severity: WhiskersFinding['severity'],
  line: number,
): WhiskersFinding {
  return {
    id: `${file}:${line}`,
    reviewId: 'r',
    file,
    line,
    severity,
    category: 'bug',
    title: `${severity} in ${file}`,
    body: '',
    suggestion: null,
    createdAt: new Date(0),
  }
}

const REVIEW: WhiskersReview = {
  id: 'r',
  owner: 'acme',
  repo: 'web',
  prNumber: 1,
  headSha: 'abcdef0',
  title: null,
  author: null,
  additions: 1,
  deletions: 1,
  status: 'completed',
  verdict: 'comment',
  summary: null,
  model: null,
  inputTokens: null,
  outputTokens: null,
  reasoningTokens: null,
  createdAt: new Date(0),
  completedAt: new Date(1000),
  findingCount: 0,
}

describe('groupByFile', () => {
  test('orders files by their worst finding, findings by severity then line', () => {
    const groups = groupByFile([
      finding('a.ts', 'low', 1),
      finding('b.ts', 'medium', 9),
      finding('b.ts', 'high', 20),
      finding('b.ts', 'medium', 3),
    ])
    expect(groups.map((g) => g.file)).toEqual(['b.ts', 'a.ts'])
    expect(groups[0]?.worst).toBe('high')
    expect(groups[0]?.findings.map((f) => f.line)).toEqual([20, 3, 9])
  })
})

describe('reviewOutcome', () => {
  test('high or critical findings block the merge', () => {
    const outcome = reviewOutcome(REVIEW, [finding('a.ts', 'high', 1), finding('a.ts', 'low', 2)])
    expect(outcome.tone).toBe('bad')
    expect(outcome.title).toBe('1 to fix before merge')
    expect(outcome.note).toBe('1 high · 1 low')
  })

  test('only medium and low findings are worth a look', () => {
    expect(reviewOutcome(REVIEW, [finding('a.ts', 'medium', 1)]).tone).toBe('warn')
  })

  test('nothing open is clean, and a running review says so', () => {
    expect(reviewOutcome(REVIEW, []).tone).toBe('ok')
    expect(reviewOutcome({ ...REVIEW, status: 'running' }, []).tone).toBe('info')
  })
})

describe('readBullets', () => {
  test('strips the bullet glyphs the summary arrives with', () => {
    expect(readBullets('• one\n\n- two\n* three')).toEqual(['one', 'two', 'three'])
  })
})
