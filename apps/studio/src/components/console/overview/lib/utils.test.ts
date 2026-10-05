import { describe, expect, test } from 'bun:test'
import type { RecentTriageActivity } from '@/integrations/studio-api'
import type { WhiskersInstance, WhiskersIssue, WhiskersReview } from '@/integrations/whiskers'
import type { ConsoleItem } from '../../shared/console-model'
import type { OverviewSearchInput } from './types'
import {
  activityIssueIds,
  greetingFor,
  isFreshInstance,
  parseOverviewSearch,
  rankAttention,
  statsFor,
  toFeedEntries,
} from './utils'

const ISSUE_ID = '6762076c-880a-40ba-ac33-2830f16207d5'
const at = (minute: number) => new Date(Date.UTC(2026, 9, 5, 12, minute))

function activity(kind: string, actorUserId: string | null, minute: number): RecentTriageActivity {
  return {
    id: `${kind}-${minute}`,
    scope: 'project:1',
    itemKind: 'issue',
    itemRef: ISSUE_ID,
    kind,
    actorUserId,
    actorName: actorUserId ? 'Juan Pérez' : null,
    actorImage: null,
    data: null,
    createdAt: at(minute),
  }
}

function review(status: WhiskersReview['status'], verdict: WhiskersReview['verdict']) {
  return {
    id: `r-${status}`,
    owner: 'acme',
    repo: 'web',
    prNumber: 7,
    title: 'Login',
    status,
    verdict,
    createdAt: at(1),
    completedAt: at(5),
  } as WhiskersReview
}

function item(id: string, patch: Partial<ConsoleItem>): ConsoleItem {
  return { id, kind: 'error', at: at(0), ...patch } as ConsoleItem
}

describe('parseOverviewSearch', () => {
  const search = (range?: string) => ({ range }) as OverviewSearchInput

  test('known ranges pass, anything else falls back to a week', () => {
    expect(parseOverviewSearch(search('30d'))).toEqual({ range: '30d' })
    expect(parseOverviewSearch(search('1y'))).toEqual({ range: '7d' })
    expect(parseOverviewSearch(search())).toEqual({ range: '7d' })
  })
})

describe('greetingFor', () => {
  test('first name and the part of the day', () => {
    expect(greetingFor('Juan Pérez', new Date(2026, 9, 5, 9))).toBe('Good morning, Juan')
    expect(greetingFor(undefined, new Date(2026, 9, 5, 20))).toBe('Good evening')
  })
})

describe('toFeedEntries', () => {
  test('merges decisions and finished reviews newest first', () => {
    const entries = toFeedEntries(
      [activity('resolved', 'u1', 3), activity('regressed', null, 9)],
      [review('completed', 'request_changes'), review('running', null)],
      new Map([[ISSUE_ID, 'TypeError in checkout']]),
      10,
    )
    expect(entries.map((entry) => [entry.actor.name, entry.verb, entry.subject])).toEqual([
      ['Whiskers', 'saw a regression in', 'TypeError in checkout'],
      ['Whiskers', 'requested changes on', 'acme/web#7 · Login'],
      ['Juan Pérez', 'resolved', 'TypeError in checkout'],
    ])
    expect(entries[0]?.link).toEqual({ kind: 'issue', issueId: ISSUE_ID })
  })

  test('an issue whiskers no longer has keeps its short id', () => {
    const [entry] = toFeedEntries([activity('archived', 'u1', 1)], [], new Map(), 5)
    expect(entry?.subject).toBe('issue 6762076c')
  })
})

describe('activityIssueIds', () => {
  test('unique issue ids only, never a review ref', () => {
    const reviewActivity = { ...activity('assigned', 'u1', 2), itemKind: 'review', itemRef: '#7' }
    expect(
      activityIssueIds([
        activity('resolved', 'u1', 1),
        activity('archived', 'u1', 2),
        reviewActivity as RecentTriageActivity,
      ]),
    ).toEqual([ISSUE_ID])
  })
})

describe('rankAttention', () => {
  test('alerts, then regressions, spikes, reviews, new issues', () => {
    const ranked = rankAttention([
      item('new', { issue: { badges: ['new'] } as WhiskersIssue }),
      item('review', { kind: 'review' }),
      item('spike', { issue: { badges: ['spiking'] } as WhiskersIssue }),
      item('alert', { kind: 'alert' }),
      item('regressed', { issue: { badges: ['new', 'regressed'] } as WhiskersIssue }),
    ])
    expect(ranked.map((entry) => entry.id)).toEqual([
      'alert',
      'regressed',
      'spike',
      'review',
      'new',
    ])
  })
})

describe('statsFor', () => {
  const signals = {
    attention: [],
    blockingReviews: 2,
    alertsFiring: 0,
    alertsArmed: 3,
    isLoading: false,
  }

  test('ranged numbers carry their series; right-now numbers do not', () => {
    const series = [
      { bucket: at(0), events: 4, newIssues: 1, regressions: 0, reviews: 2, failedReviews: 0 },
      { bucket: at(1), events: 6, newIssues: 0, regressions: 1, reviews: 1, failedReviews: 1 },
    ]
    const stats = statsFor(
      '24h',
      {
        summary: { events: 10, issues: 3 },
        range: '24h',
        stepMs: 3_600_000,
        series,
        totals: {
          events: 10,
          newIssues: 1,
          regressions: 1,
          reviews: 3,
          failedReviews: 1,
          unresolved: 5,
        },
      },
      signals,
    )
    const byKey = new Map(stats.map((stat) => [stat.key, stat]))
    expect(byKey.get('events')?.trend).toEqual([4, 6])
    expect(byKey.get('unresolved')?.value).toBe(5)
    expect(byKey.get('blocking')).toMatchObject({ value: 2, tone: 'warning' })
    expect(byKey.get('alerts')).toMatchObject({ value: 0, tone: 'neutral', hint: '3 armed' })
  })
})

describe('isFreshInstance', () => {
  const worker = (review: number, event: number) =>
    ({
      stores: [
        { table: 'review', rows: review },
        { table: 'event', rows: event },
      ],
    }) as WhiskersInstance

  test('fresh until the first review or error', () => {
    expect(isFreshInstance(worker(0, 0))).toBe(true)
    expect(isFreshInstance(worker(1, 0))).toBe(false)
    expect(isFreshInstance(worker(0, 3))).toBe(false)
    expect(isFreshInstance(undefined)).toBe(false)
  })
})
