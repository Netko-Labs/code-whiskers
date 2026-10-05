import { describe, expect, test } from 'bun:test'
import type { SentryEvent } from '@code-whiskers/whiskers-domain'
import { badgesOf, decodeCursor, encodeCursor, uuidsOf } from '../src/queries/tracker'
import { denseSeries, trendStartOf } from '../src/queries/tracker/utils'
import {
  eventCulpritOf,
  type IssueLifecycleFields,
  ingestTransitionOf,
  needsReleaseAge,
  userKeyOf,
} from '../src/tracker'

const NOW = new Date('2026-10-04T12:00:00.000Z')
const HOUR = 60 * 60 * 1000
const ago = (ms: number) => new Date(NOW.getTime() - ms)

const issue = (fields: Partial<IssueLifecycleFields>): IssueLifecycleFields => ({
  status: 'unresolved',
  resolvedInRelease: null,
  resolvedAt: null,
  archivedUntil: null,
  archiveUntilEvents: null,
  archiveUntilUsers: null,
  eventCount: 1,
  userCount: 0,
  ...fields,
})

const event = (release: string | null, releaseFirstSeenAt: Date | null = null) => ({
  release,
  releaseFirstSeenAt,
  now: NOW,
})

describe('ingestTransitionOf — resolved', () => {
  const resolvedNow = issue({ status: 'resolved', resolvedAt: ago(HOUR) })
  const nextRelease = issue({ status: 'resolved', resolvedAt: ago(HOUR), resolvedInRelease: 'v1' })

  test('resolved now: any recurrence regresses, release or not', () => {
    expect(ingestTransitionOf(resolvedNow, event(null))).toBe('regressed')
    expect(ingestTransitionOf(resolvedNow, event('v1'))).toBe('regressed')
  })

  test('next release: the same release, or none, is the old code still running', () => {
    expect(ingestTransitionOf(nextRelease, event('v1'))).toBeNull()
    expect(ingestTransitionOf(nextRelease, event(null))).toBeNull()
    expect(needsReleaseAge(nextRelease, 'v1')).toBe(false)
    expect(needsReleaseAge(nextRelease, null)).toBe(false)
  })

  test('next release: a release that reached the project after the resolve regresses', () => {
    expect(needsReleaseAge(nextRelease, 'v2')).toBe(true)
    expect(ingestTransitionOf(nextRelease, event('v2', ago(HOUR / 2)))).toBe('regressed')
  })

  test('next release: an older release still in the wild does not', () => {
    expect(ingestTransitionOf(nextRelease, event('v0', ago(2 * HOUR)))).toBeNull()
    expect(ingestTransitionOf(nextRelease, event('v2', null))).toBeNull()
  })

  test('only a resolved issue ever needs a release age', () => {
    expect(needsReleaseAge(issue({ resolvedInRelease: 'v1' }), 'v2')).toBe(false)
  })
})

describe('ingestTransitionOf — archived', () => {
  test('until: over once the time passes, on the next event', () => {
    expect(
      ingestTransitionOf(issue({ status: 'archived', archivedUntil: ago(1) }), event(null)),
    ).toBe('unarchived')
    expect(
      ingestTransitionOf(issue({ status: 'archived', archivedUntil: ago(-HOUR) }), event(null)),
    ).toBeNull()
  })

  test('events: over when the total reaches the target', () => {
    const archived = { status: 'archived' as const, archiveUntilEvents: 110 }
    expect(ingestTransitionOf(issue({ ...archived, eventCount: 109 }), event(null))).toBeNull()
    expect(ingestTransitionOf(issue({ ...archived, eventCount: 110 }), event(null))).toBe(
      'unarchived',
    )
  })

  test('users: over when distinct users reach the target', () => {
    const archived = { status: 'archived' as const, archiveUntilUsers: 5 }
    expect(ingestTransitionOf(issue({ ...archived, userCount: 4 }), event(null))).toBeNull()
    expect(ingestTransitionOf(issue({ ...archived, userCount: 5 }), event(null))).toBe('unarchived')
  })

  test('forever stays archived, and unresolved has nothing to change', () => {
    expect(
      ingestTransitionOf(issue({ status: 'archived', eventCount: 1e6 }), event('v9')),
    ).toBeNull()
    expect(ingestTransitionOf(issue({}), event('v9'))).toBeNull()
  })
})

describe('badgesOf', () => {
  const base = {
    firstSeen: ago(30 * 24 * HOUR),
    status: 'unresolved',
    regressedAt: null,
    lastHourEvents: 0,
    previousWeekEvents: 0,
  }

  test('new for its first seven days', () => {
    expect(badgesOf({ ...base, firstSeen: ago(6 * 24 * HOUR) }, NOW)).toEqual(['new'])
    expect(badgesOf({ ...base, firstSeen: ago(8 * 24 * HOUR) }, NOW)).toEqual([])
  })

  test('regressed only while unresolved and recent', () => {
    expect(badgesOf({ ...base, regressedAt: ago(HOUR) }, NOW)).toEqual(['regressed'])
    expect(badgesOf({ ...base, regressedAt: ago(8 * 24 * HOUR) }, NOW)).toEqual([])
    expect(badgesOf({ ...base, status: 'resolved', regressedAt: ago(HOUR) }, NOW)).toEqual([])
  })

  test('spiking: above ten an hour, and ten times the weekly hourly average', () => {
    expect(badgesOf({ ...base, lastHourEvents: 10 }, NOW)).toEqual([])
    expect(badgesOf({ ...base, lastHourEvents: 11 }, NOW)).toEqual(['spiking'])
    const busyWeek = { ...base, previousWeekEvents: 168 * 5 }
    expect(badgesOf({ ...busyWeek, lastHourEvents: 50 }, NOW)).toEqual([])
    expect(badgesOf({ ...busyWeek, lastHourEvents: 51 }, NOW)).toEqual(['spiking'])
  })
})

describe('cursor', () => {
  const id = '6762076c-880a-40ba-ac33-2830f16207d5'

  test('round-trips a date sort and a count sort', () => {
    expect(decodeCursor(encodeCursor('2026-10-04T12:00:00.000Z', id))).toEqual({
      value: '2026-10-04T12:00:00.000Z',
      id,
    })
    expect(decodeCursor(encodeCursor(42, id))).toEqual({ value: 42, id })
  })

  test('anything we did not mint decodes to null', () => {
    expect(decodeCursor('garbage')).toBeNull()
    expect(decodeCursor(Buffer.from('[1,"not-a-uuid"]').toString('base64url'))).toBeNull()
    expect(decodeCursor(Buffer.from('{"a":1}').toString('base64url'))).toBeNull()
  })
})

describe('userKeyOf', () => {
  const sha = (text: string) => new Bun.CryptoHasher('sha256').update(text).digest('hex')
  const of = (user: unknown) => userKeyOf({ user } as SentryEvent)

  test('id, else email, else IP — hashed, never stored raw', () => {
    expect(of({ id: 'u1', email: 'a@b.c' })).toBe(sha('u1'))
    expect(of({ email: 'a@b.c', ip_address: '1.2.3.4' })).toBe(sha('a@b.c'))
    expect(of({ ip_address: '1.2.3.4' })).toBe(sha('1.2.3.4'))
  })

  test('a numeric id hashes like the SQL backfill reads it', () => {
    expect(of({ id: 42 })).toBe('73475cb40a568e8da8a045ced110137e159f890ac4da883b6b17dc651b3a8049')
  })

  test('nobody named: no user, empty values, or the {{auto}} IP placeholder', () => {
    expect(of(undefined)).toBeNull()
    expect(of({ id: '', ip_address: '{{auto}}' })).toBeNull()
    expect(of('not an object')).toBeNull()
  })
})

describe('eventCulpritOf', () => {
  test('the last in-app frame of the thrown error', () => {
    const culprit = eventCulpritOf({
      exception: {
        values: [
          {
            type: 'TypeError',
            stacktrace: {
              frames: [
                { module: 'app.auth', function: 'login', in_app: true },
                { filename: 'node_modules/lib.js', function: 'call' },
              ],
            },
          },
        ],
      },
    } as SentryEvent)
    expect(culprit).toBe('app.auth:login')
    expect(eventCulpritOf({ message: 'plain' } as SentryEvent)).toBeNull()
  })
})

describe('series helpers', () => {
  test('the trend starts at midnight UTC thirteen days back', () => {
    expect(trendStartOf(NOW).toISOString()).toBe('2026-09-21T00:00:00.000Z')
  })

  test('sparse buckets fill a dense series and out-of-range ones drop', () => {
    expect(
      denseSeries(3, [
        { bucket: 0, count: 2 },
        { bucket: 2, count: 1 },
        { bucket: 5, count: 9 },
      ]),
    ).toEqual([2, 0, 1])
  })

  test('ids: invalid ones drop, and asking with none valid is an empty filter', () => {
    expect(uuidsOf(undefined)).toBeUndefined()
    expect(uuidsOf('bogus')).toEqual([])
    expect(uuidsOf('6762076c-880a-40ba-ac33-2830f16207d5, bogus')).toEqual([
      '6762076c-880a-40ba-ac33-2830f16207d5',
    ])
  })
})
