import { describe, expect, test } from 'bun:test'
import type { WhiskersIssue } from '@/integrations/whiskers'
import { sampleIssues } from '../../../shared/console-data'
import type { SelectionState } from './types'
import { EMPTY_SELECTION, sampleRows, selectionReducer, statusForTab, visibleIssues } from './utils'

const ORDER = ['a', 'b', 'c', 'd', 'e']

const BASE: WhiskersIssue = {
  id: 'x',
  projectId: 'p1',
  fingerprint: 'x',
  title: 'Issue',
  level: 'error',
  status: 'unresolved',
  eventCount: 1,
  userCount: 1,
  firstSeen: new Date(0),
  lastSeen: new Date(0),
  firstRelease: null,
  lastRelease: null,
  resolvedInRelease: null,
  resolvedAt: null,
  archivedUntil: null,
  archiveUntilEvents: null,
  archiveUntilUsers: null,
  regressedAt: null,
  badges: [],
  trend: [],
  culprit: null,
}

function toggle(state: SelectionState, id: string, isRange = false) {
  return selectionReducer(state, { kind: 'toggle', id, isRange, order: ORDER })
}

describe('selectionReducer', () => {
  test('a click toggles one row and becomes the anchor', () => {
    const once = toggle(EMPTY_SELECTION, 'b')
    expect(once).toEqual({ ids: ['b'], anchor: 'b' })
    expect(toggle(once, 'b').ids).toEqual([])
  })

  test('shift-click selects the visible range from the anchor, either direction', () => {
    const down = toggle(toggle(EMPTY_SELECTION, 'b'), 'd', true)
    expect(down.ids.sort()).toEqual(['b', 'c', 'd'])
    const up = toggle(toggle(EMPTY_SELECTION, 'e'), 'c', true)
    expect(up.ids.sort()).toEqual(['c', 'd', 'e'])
  })

  test('shift-click with no anchor acts like a click', () => {
    expect(toggle(EMPTY_SELECTION, 'c', true)).toEqual({ ids: ['c'], anchor: 'c' })
  })

  test('select all, then select all again clears', () => {
    const all = selectionReducer(EMPTY_SELECTION, { kind: 'all', ids: ORDER })
    expect(all.ids).toEqual(ORDER)
    expect(selectionReducer(all, { kind: 'all', ids: ORDER })).toEqual(EMPTY_SELECTION)
  })

  test('rows that leave the view leave the selection', () => {
    const state = { ids: ['a', 'c'], anchor: 'c' }
    expect(selectionReducer(state, { kind: 'keep', ids: ['a', 'b'] }).ids).toEqual(['a'])
    expect(selectionReducer(state, { kind: 'keep', ids: ORDER })).toBe(state)
  })

  test('clear empties it', () => {
    expect(selectionReducer({ ids: ['a'], anchor: 'a' }, { kind: 'clear' })).toEqual(
      EMPTY_SELECTION,
    )
  })
})

describe('list views', () => {
  const row = (id: string, overrides: Partial<WhiskersIssue>): WhiskersIssue => ({
    ...BASE,
    id,
    ...overrides,
  })
  const rows = [
    row('open', {}),
    row('back', { badges: ['regressed'] }),
    row('done', { status: 'resolved' }),
  ]

  test('tabs map to statuses; regressions always reads unresolved', () => {
    expect(statusForTab('issues', 2)).toBe('archived')
    expect(statusForTab('issues', 9)).toBe('unresolved')
    expect(statusForTab('regressions', 3)).toBe('unresolved')
  })

  test('an optimistic resolve leaves the unresolved tab; regressions keep the badge only', () => {
    expect(visibleIssues(rows, 'unresolved', 'issues').map((r) => r.id)).toEqual(['open', 'back'])
    expect(visibleIssues(rows, 'all', 'issues')).toHaveLength(3)
    expect(visibleIssues(rows, 'unresolved', 'regressions').map((r) => r.id)).toEqual(['back'])
  })
})

describe('sampleRows', () => {
  const issues = sampleIssues(new Date('2026-10-04T12:00:00.000Z'))
  const all = { status: 'all', sort: 'last_seen' } as const
  const ids = (params: Parameters<typeof sampleRows>[1]) =>
    sampleRows(issues, params).map((issue) => issue.id)

  test('status, search and ids filter like the server', () => {
    expect(ids({ ...all, status: 'resolved' })).toEqual(['sample-2036'])
    expect(ids({ ...all, q: ' billing ' })).toEqual(['sample-2039'])
    expect(ids({ ...all, ids: ['sample-2044', 'nope'] })).toEqual(['sample-2044'])
    expect(ids({ ...all, ids: [] })).toEqual([])
  })

  test('environment and release match the fixture event', () => {
    expect(ids({ ...all, release: 'v4.18.1' })).toEqual(['sample-2039', 'sample-2036'])
    expect(ids({ ...all, environment: 'staging' })).toEqual([])
    expect(ids({ ...all, environment: 'production' })).toHaveLength(issues.length)
  })

  test('regressed keeps only unresolved issues badged regressed', () => {
    expect(ids({ ...all, isRegressed: true })).toEqual(['sample-2041'])
  })
})
