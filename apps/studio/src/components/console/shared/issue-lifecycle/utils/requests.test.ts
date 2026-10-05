import { describe, expect, test } from 'bun:test'
import type { WhiskersIssue } from '@/integrations/whiskers'
import { HOUR_MS } from '../constants'
import { ARCHIVE_GROUPS } from '../values'
import { applyAction, archiveSpecFor, lifecycleRequests, restoreRequests } from './requests'

const NOW = new Date('2026-10-04T12:00:00.000Z')

function issue(id: string, overrides: Partial<WhiskersIssue> = {}): WhiskersIssue {
  return {
    id,
    projectId: 'p1',
    fingerprint: id,
    title: `Issue ${id}`,
    level: 'error',
    status: 'unresolved',
    eventCount: 40,
    userCount: 7,
    firstSeen: new Date('2026-09-01T00:00:00.000Z'),
    lastSeen: new Date('2026-10-04T11:00:00.000Z'),
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

function option(id: string) {
  const found = ARCHIVE_GROUPS.flatMap((group) => group.options).find((o) => o.id === id)
  if (!found) throw new Error(`no archive option ${id}`)
  return found.choice
}

describe('archive menu → request body', () => {
  test('forever sends no target', () => {
    expect(archiveSpecFor(option('forever'), NOW)).toEqual({ mode: 'forever' })
  })

  test('a duration becomes an absolute deadline', () => {
    expect(archiveSpecFor(option('2h'), NOW)).toEqual({
      mode: 'until',
      until: new Date(NOW.getTime() + 2 * HOUR_MS).toISOString(),
    })
  })

  test('event and user thresholds send the count still to come', () => {
    expect(archiveSpecFor(option('e1000'), NOW)).toEqual({ mode: 'events', count: 1000 })
    expect(archiveSpecFor(option('u100'), NOW)).toEqual({ mode: 'users', count: 100 })
  })

  test('every option maps to a body the contract accepts', () => {
    for (const { choice } of ARCHIVE_GROUPS.flatMap((group) => group.options)) {
      const spec = archiveSpecFor(choice, NOW)
      expect(['forever', 'until', 'events', 'users']).toContain(spec.mode)
      if ('count' in spec) expect(spec.count).toBeGreaterThan(0)
    }
  })
})

describe('lifecycleRequests', () => {
  test('groups issues by project scope', () => {
    const requests = lifecycleRequests(
      [issue('a'), issue('b', { projectId: 'p2' }), issue('c')],
      { kind: 'resolve', mode: 'next_release' },
      NOW,
    )
    expect(requests).toEqual([
      {
        scope: 'project:p1',
        issueIds: ['a', 'c'],
        status: 'resolved',
        resolve: { mode: 'next_release' },
      },
      {
        scope: 'project:p2',
        issueIds: ['b'],
        status: 'resolved',
        resolve: { mode: 'next_release' },
      },
    ])
  })

  test('unresolve sends only the status', () => {
    expect(lifecycleRequests([issue('a')], { kind: 'unresolve' }, NOW)).toEqual([
      { scope: 'project:p1', issueIds: ['a'], status: 'unresolved' },
    ])
  })
})

describe('restoreRequests (undo)', () => {
  test('puts each issue back the way it was', () => {
    const until = new Date('2026-10-05T00:00:00.000Z')
    const requests = restoreRequests([
      issue('open'),
      issue('next', { status: 'resolved', resolvedInRelease: 'v1.2.0' }),
      issue('timed', { status: 'archived', archivedUntil: until }),
      issue('counted', { status: 'archived', archiveUntilEvents: 140 }),
    ])
    expect(requests).toEqual([
      { scope: 'project:p1', issueIds: ['open'], status: 'unresolved' },
      {
        scope: 'project:p1',
        issueIds: ['next'],
        status: 'resolved',
        resolve: { mode: 'next_release' },
      },
      {
        scope: 'project:p1',
        issueIds: ['timed'],
        status: 'archived',
        archive: { mode: 'until', until: until.toISOString() },
      },
      {
        scope: 'project:p1',
        issueIds: ['counted'],
        status: 'archived',
        archive: { mode: 'events', count: 100 },
      },
    ])
  })
})

describe('applyAction (optimistic row)', () => {
  test('resolving in the next release waits on the latest release and drops the regression', () => {
    const next = applyAction(
      issue('a', { badges: ['regressed', 'spiking'] }),
      { kind: 'resolve', mode: 'next_release' },
      NOW,
    )
    expect(next.status).toBe('resolved')
    expect(next.resolvedInRelease).toBe('v1.2.0')
    expect(next.badges).toEqual(['spiking'])
  })

  test('archiving by events sets the target total', () => {
    const next = applyAction(issue('a'), { kind: 'archive', choice: option('e100') }, NOW)
    expect(next.status).toBe('archived')
    expect(next.archiveUntilEvents).toBe(140)
    expect(next.archivedUntil).toBeNull()
  })

  test('unresolving clears every lifecycle field', () => {
    const next = applyAction(
      issue('a', { status: 'archived', archiveUntilUsers: 20 }),
      { kind: 'unresolve' },
      NOW,
    )
    expect(next.status).toBe('unresolved')
    expect(next.archiveUntilUsers).toBeNull()
  })
})
