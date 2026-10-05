import { describe, expect, test } from 'bun:test'
import type { WhiskersFinding, WhiskersReview } from '@/integrations/whiskers'
import {
  findingsAsOf,
  groupByFile,
  isSameFinding,
  newFindingCount,
  pullRequestVerdict,
  pushCoverage,
  summarizePullRequests,
  summaryLines,
} from '.'

function review(id: string, minute: number, extra: Partial<WhiskersReview> = {}): WhiskersReview {
  return {
    id,
    owner: 'Acme',
    repo: 'web',
    prNumber: 7,
    headSha: `${id}000000`,
    headRef: 'feature',
    title: 'Add checkout',
    author: 'ada',
    additions: 10,
    deletions: 2,
    status: 'completed',
    verdict: 'request_changes',
    summary: 'Looks fine',
    model: 'm',
    diffScope: 'full',
    deltaFrom: null,
    inputTokens: null,
    outputTokens: null,
    reasoningTokens: null,
    createdAt: new Date(minute * 60_000),
    completedAt: new Date(minute * 60_000 + 30_000),
    findingCount: 0,
    findingsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    ...extra,
  }
}

function finding(reviewId: string, title: string, extra: Partial<WhiskersFinding> = {}) {
  return {
    id: `${reviewId}:${title}`,
    reviewId,
    file: 'src/pay.ts',
    line: 10,
    severity: 'high',
    category: 'bug',
    title,
    body: '',
    suggestion: null,
    createdAt: new Date(0),
    ...extra,
  } satisfies WhiskersFinding
}

const never = () => false

describe('summarizePullRequests', () => {
  test('one row per pull request, verdict from the newest push, counts from the newest done', () => {
    const counts = { critical: 1, high: 0, medium: 2, low: 0 }
    const rows = summarizePullRequests([
      review('a', 1, { findingsBySeverity: counts, findingCount: 3 }),
      review('b', 2, { status: 'running', verdict: null, completedAt: null }),
      review('c', 3, { repo: 'api', prNumber: 1, verdict: 'approve' }),
    ])
    expect(rows.map((row) => row.key)).toEqual(['acme/api#1', 'acme/web#7'])
    const web = rows[1]
    expect(web?.verdict).toBe('running')
    expect(web?.counts).toEqual(counts)
    expect(web?.pushes).toBe(2)
    expect(rows[0]?.verdict).toBe('approved')
  })

  test('a done review without a verdict reads as a comment', () => {
    expect(pullRequestVerdict(review('a', 1, { verdict: null }))).toBe('commented')
    expect(pullRequestVerdict(review('a', 1, { status: 'failed' }))).toBe('failed')
  })
})

describe('isSameFinding', () => {
  test('rewordings in the same file match, other files do not', () => {
    const a = finding('a', 'Float arithmetic on money amounts')
    expect(isSameFinding(a, finding('b', 'Money amounts use float arithmetic'))).toBe(true)
    expect(isSameFinding(a, finding('b', 'Float arithmetic on money', { file: 'x.ts' }))).toBe(
      false,
    )
    expect(isSameFinding(a, finding('b', 'Missing null check'))).toBe(false)
  })
})

describe('findingsAsOf', () => {
  test('a full read resolves what it dropped; a delta leaves it outdated', () => {
    const pushes = [
      review('c', 3, { diffScope: 'delta', deltaFrom: 'b000000' }),
      review('b', 2),
      review('a', 1),
    ]
    const findings = [
      finding('a', 'Race in retry loop'),
      finding('b', 'Unchecked refund total'),
      finding('c', 'Leaks the session token', { file: 'src/auth.ts' }),
    ]
    const asOfC = findingsAsOf(pushes, findings, pushes[0] as WhiskersReview, never)
    const status = Object.fromEntries(asOfC.map((entry) => [entry.finding.title, entry.status]))
    expect(status).toEqual({
      'Leaks the session token': 'open',
      'Unchecked refund total': 'outdated',
      'Race in retry loop': 'resolved',
    })
  })

  test('a re-reported finding stays open once; dismissals win', () => {
    const pushes = [review('b', 2), review('a', 1)]
    const findings = [
      finding('a', 'Unchecked refund total'),
      finding('b', 'Refund total unchecked'),
    ]
    const entries = findingsAsOf(pushes, findings, pushes[0] as WhiskersReview, (f) =>
      f.title.startsWith('Refund'),
    )
    expect(entries).toHaveLength(1)
    expect(entries[0]?.status).toBe('dismissed')
  })

  test('a partial full read vouches for nothing', () => {
    const pushes = [
      review('b', 2, { summary: 'Partial review — 2 of 9 sections could not be reviewed.\nok' }),
      review('a', 1),
    ]
    const entries = findingsAsOf(pushes, [finding('a', 'Old')], pushes[0] as WhiskersReview, never)
    expect(entries[0]?.status).toBe('outdated')
  })
})

describe('push helpers', () => {
  test('new findings are the ones the previous push did not raise', () => {
    const findings = [
      finding('a', 'Unchecked refund'),
      finding('b', 'Refund unchecked'),
      finding('b', 'New one'),
    ]
    expect(newFindingCount(review('b', 2), review('a', 1), findings)).toBe(1)
    expect(newFindingCount(review('a', 1), undefined, findings)).toBe(1)
  })

  test('partial coverage and summary bullets', () => {
    const summary = 'Partial review — 2 of 9 sections could not be reviewed.\n- one\n• two'
    expect(pushCoverage(summary)).toEqual({ skipped: 2, total: 9 })
    expect(pushCoverage('fine')).toBeNull()
    expect(summaryLines(summary)).toEqual(['one', 'two'])
  })

  test('files ordered by their worst finding', () => {
    const groups = groupByFile([
      {
        finding: finding('a', 'x', { file: 'b.ts', severity: 'low' }),
        status: 'open',
        reportedBy: review('a', 1),
        settledBy: null,
      },
      {
        finding: finding('a', 'y', { file: 'a.ts', severity: 'critical' }),
        status: 'open',
        reportedBy: review('a', 1),
        settledBy: null,
      },
    ])
    expect(groups.map((group) => group.file)).toEqual(['a.ts', 'b.ts'])
  })
})
