import { describe, expect, test } from 'bun:test'
import type { WhiskersIssue } from '@/integrations/whiskers'
import { issueBadges, lifecycleMessage, shortRelease, statusBanner } from './copy'

const NOW = new Date(2026, 9, 4, 9, 0)

function issue(overrides: Partial<WhiskersIssue> = {}): WhiskersIssue {
  return {
    id: 'a',
    projectId: 'p1',
    fingerprint: 'a',
    title: 'TypeError: cannot read sessionId',
    level: 'error',
    status: 'unresolved',
    eventCount: 40,
    userCount: 7,
    firstSeen: new Date(2026, 8, 1),
    lastSeen: new Date(2026, 9, 4, 8, 0),
    firstRelease: 'v1.0.0',
    lastRelease: 'v1.2.0',
    resolvedInRelease: null,
    resolvedAt: null,
    regressedAt: null,
    archivedUntil: null,
    archiveUntilEvents: null,
    archiveUntilUsers: null,
    badges: [],
    trend: [],
    culprit: null,
    ...overrides,
  }
}

describe('statusBanner', () => {
  test('an open issue has no banner', () => {
    expect(statusBanner(issue(), NOW)).toBeNull()
  })

  test('resolved in next release names the release it waits on, sha shortened', () => {
    const banner = statusBanner(
      issue({ status: 'resolved', resolvedInRelease: 'a1b2c3d4e5f60718293a' }),
      NOW,
    )
    expect(banner?.message).toBe('Resolved in next release (after a1b2c3d)')
    expect(banner?.tone).toBe('ok')
  })

  test('archived until a date far off reads as a calendar day', () => {
    const banner = statusBanner(
      issue({ status: 'archived', archivedUntil: new Date(2026, 9, 21, 14, 30) }),
      NOW,
    )
    expect(banner?.message).toBe('Archived until Oct 21')
  })

  test('archived until later today reads as a clock', () => {
    const banner = statusBanner(
      issue({ status: 'archived', archivedUntil: new Date(2026, 9, 4, 14, 30) }),
      NOW,
    )
    expect(banner?.message).toBe('Archived until 14:30')
  })

  test('archived by count shows how many are left', () => {
    expect(statusBanner(issue({ status: 'archived', archiveUntilEvents: 140 }), NOW)?.message).toBe(
      'Archived until 100 more events',
    )
    expect(statusBanner(issue({ status: 'archived', archiveUntilUsers: 8 }), NOW)?.message).toBe(
      'Archived until 1 more user',
    )
  })

  test('archived forever and regressed', () => {
    expect(statusBanner(issue({ status: 'archived' }), NOW)?.message).toBe('Archived forever')
    expect(statusBanner(issue({ badges: ['regressed'] }), NOW)?.tone).toBe('warn')
  })
})

describe('issueBadges', () => {
  test('server badges come in urgency order', () => {
    const badges = issueBadges(issue({ badges: ['new', 'spiking', 'regressed'] }), false)
    expect(badges.map((badge) => badge.label)).toEqual(['Regressed', 'Spiking', 'New'])
  })

  test('the status leads only where statuses mix', () => {
    const resolved = issue({ status: 'resolved', badges: ['new'] })
    expect(issueBadges(resolved, true).map((badge) => badge.key)).toEqual(['resolved', 'new'])
    expect(issueBadges(resolved, false).map((badge) => badge.key)).toEqual(['new'])
    expect(issueBadges(issue(), true)).toEqual([])
  })
})

describe('lifecycle copy', () => {
  test('one issue is named, many are counted', () => {
    expect(lifecycleMessage({ kind: 'resolve', mode: 'now' }, [issue()])).toBe(
      'Resolved TypeError: cannot read sessionId',
    )
    expect(
      lifecycleMessage({ kind: 'archive', choice: { kind: 'events', count: 100 } }, [
        issue(),
        issue({ id: 'b' }),
      ]),
    ).toBe('Archived 2 issues until 100 more events')
  })

  test('a named release stays as it is', () => {
    expect(shortRelease('api@4.18.2')).toBe('api@4.18.2')
  })
})
