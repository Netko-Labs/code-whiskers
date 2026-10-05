import { describe, expect, test } from 'bun:test'
import type { TriageRecord } from '@/integrations/studio-api'
import type { WhiskersIssue } from '@/integrations/whiskers'
import type { ConsoleItem } from '../../console-model'
import { inBucket, needsAttention, statusFor, triageKey } from './triage'

const NOW = new Date('2026-10-05T12:00:00.000Z')
const HOUR = 60 * 60 * 1000
const ago = (ms: number) => new Date(NOW.getTime() - ms)

function review(at: Date, severity: ConsoleItem['severity'] = 'critical'): ConsoleItem {
  return {
    id: 'acme/web#12',
    handle: '#12',
    triage: { scope: 'acme/web', itemKind: 'review', itemRef: '#12' },
    at,
    kind: 'review',
    repository: 'acme/web',
    scopeLabel: 'web',
    label: '',
    severity,
    age: '',
    title: 'Fix login',
    subtitle: '',
    meta: '',
    badge: 'REVIEW',
    badge2: '',
    confidence: '',
    read: '',
  }
}

function issue(badges: WhiskersIssue['badges']): ConsoleItem {
  return {
    ...review(NOW),
    id: 'project:1/i',
    kind: 'error',
    triage: { scope: 'project:1', itemKind: 'issue', itemRef: 'i' },
    issue: { status: 'unresolved', badges } as WhiskersIssue,
  }
}

function records(status: TriageRecord['status'], updatedAt: Date): Map<string, TriageRecord> {
  const record: TriageRecord = {
    scope: 'acme/web',
    itemKind: 'review',
    itemRef: '#12',
    status,
    assigneeUserId: 'u1',
    snoozedUntil: null,
    note: null,
    updatedAt,
  } as TriageRecord
  return new Map([[triageKey(record), record]])
}

describe('statusFor', () => {
  test('a done review stays done until it moves again', () => {
    const item = review(ago(2 * HOUR))
    expect(statusFor(item, records('archived', ago(HOUR)), NOW).done).toBe(true)
    const pushedAgain = review(ago(HOUR / 2))
    const status = statusFor(pushedAgain, records('archived', ago(HOUR)), NOW)
    expect(status.done).toBe(false)
    expect(status.assigneeUserId).toBe('u1')
  })

  test('an issue is archived by whiskers, never by a stale studio record', () => {
    expect(statusFor(issue([]), new Map(), NOW).archived).toBe(false)
  })
})

describe('needsAttention', () => {
  test('issues need a badge', () => {
    expect(needsAttention(issue([]))).toBe(false)
    expect(needsAttention(issue(['regressed']))).toBe(true)
  })

  test('reviews need to block or fail', () => {
    expect(needsAttention(review(NOW, 'critical'))).toBe(true)
    expect(needsAttention(review(NOW, 'warning'))).toBe(false)
  })
})

describe('inBucket', () => {
  const quiet = review(NOW, 'warning')

  test('the inbox keeps only what needs attention; assigned keeps the rest', () => {
    const status = statusFor(quiet, records('open', NOW), NOW)
    expect(inBucket(quiet, status, 'inbox', 'u1')).toBe(false)
    expect(inBucket(quiet, status, 'assigned', 'u1')).toBe(true)
  })

  test('done leaves every bucket', () => {
    const item = review(ago(HOUR))
    const status = statusFor(item, records('archived', NOW), NOW)
    expect(inBucket(item, status, 'inbox', 'u1')).toBe(false)
    expect(inBucket(item, status, 'assigned', 'u1')).toBe(false)
  })
})
