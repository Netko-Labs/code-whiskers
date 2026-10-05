import { describe, expect, test } from 'bun:test'
import type { WhiskersFinding, WhiskersReview } from '@/integrations/whiskers'
import { reviewPageData, suggestionBlock, tokensLabel } from './utils'

function push(id: string, minute: number, extra: Partial<WhiskersReview> = {}): WhiskersReview {
  return {
    id,
    owner: 'acme',
    repo: 'web',
    prNumber: 4,
    headSha: `${id}aaaaaaa`,
    headRef: 'fix',
    title: 'Fix it',
    author: 'ada',
    additions: 1,
    deletions: 1,
    status: 'completed',
    verdict: 'request_changes',
    summary: 'ok',
    model: 'm',
    diffScope: 'full',
    deltaFrom: null,
    inputTokens: null,
    outputTokens: null,
    reasoningTokens: null,
    createdAt: new Date(minute * 60_000),
    completedAt: new Date(minute * 60_000 + 1),
    findingCount: 1,
    findingsBySeverity: { critical: 0, high: 1, medium: 0, low: 0 },
    ...extra,
  }
}

function finding(reviewId: string, title: string): WhiskersFinding {
  return {
    id: `${reviewId}-${title}`,
    reviewId,
    file: 'a.ts',
    line: 3,
    severity: 'high',
    category: 'bug',
    title,
    body: '',
    suggestion: null,
    createdAt: new Date(0),
  }
}

describe('reviewPageData', () => {
  const thread = {
    pushes: [push('c', 3, { status: 'running', completedAt: null }), push('b', 2), push('a', 1)],
    findings: [finding('a', 'Retry loop races'), finding('b', 'Refund total unchecked')],
  }

  test('a running push reads as of the last finished one', () => {
    const data = reviewPageData(thread, 'c', () => false)
    expect(data?.basis?.id).toBe('b')
    expect(data?.latest.id).toBe('c')
    expect(data?.findings.map((entry) => entry.status)).toEqual(['open', 'resolved'])
    expect(data?.timeline.map((entry) => entry.newCount)).toEqual([0, 1, 1])
  })

  test('an unknown id has no page', () => {
    expect(reviewPageData(thread, 'zzz', () => false)).toBeNull()
  })
})

describe('suggestionBlock', () => {
  test('fences are stripped; one line of prose stays prose', () => {
    expect(suggestionBlock('```ts\nconst a = 1\n```')).toEqual({
      code: 'const a = 1',
      isBlock: true,
    })
    expect(suggestionBlock('Use integer cents.')).toEqual({
      code: 'Use integer cents.',
      isBlock: false,
    })
  })

  test('tokens read only when metered', () => {
    expect(tokensLabel(null, null)).toBeNull()
    expect(tokensLabel(1200, 30)).toBe('1,200 in · 30 out')
  })
})
