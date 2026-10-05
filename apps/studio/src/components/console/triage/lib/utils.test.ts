import { describe, expect, test } from 'bun:test'
import type { ConsoleItem } from '../../shared/console-model'
import {
  goneRows,
  groupByRecency,
  matchesFilter,
  mergeLeaving,
  nextSelection,
  recencyOf,
} from './utils'

function item(id: string, at?: Date, kind: ConsoleItem['kind'] = 'review'): ConsoleItem {
  return {
    id,
    handle: id,
    triage: null,
    at,
    kind,
    repository: null,
    scopeLabel: 'web',
    label: '',
    severity: 'critical',
    age: '1m',
    title: id,
    subtitle: '',
    meta: '',
    badge: '',
    badge2: '',
    confidence: '',
    read: '',
  }
}

const NOW = new Date(2026, 9, 5, 15, 0)
const a = item('a')
const b = item('b')
const c = item('c')

describe('recencyOf', () => {
  test('today starts at local midnight', () => {
    expect(recencyOf(new Date(2026, 9, 5, 0, 1), NOW)).toBe('today')
    expect(recencyOf(new Date(2026, 9, 4, 23, 59), NOW)).toBe('week')
  })

  test('a week back is still this week; older, or undated, is earlier', () => {
    expect(recencyOf(new Date(2026, 8, 29, 9), NOW)).toBe('week')
    expect(recencyOf(new Date(2026, 8, 28, 9), NOW)).toBe('earlier')
    expect(recencyOf(undefined, NOW)).toBe('earlier')
  })
})

describe('groupByRecency', () => {
  test('keeps list order inside a band and drops empty bands', () => {
    const rows = [
      { item: item('x', new Date(2026, 9, 5, 14)), isLeaving: false },
      { item: item('y', new Date(2026, 7, 1)), isLeaving: false },
      { item: item('z', new Date(2026, 9, 5, 9)), isLeaving: false },
    ]
    const groups = groupByRecency(rows, NOW)
    expect(groups.map((group) => group.label)).toEqual(['Today', 'Earlier'])
    expect(groups[0]?.rows.map((row) => row.item.id)).toEqual(['x', 'z'])
  })
})

describe('leaving rows', () => {
  test('goneRows names what left and where it stood', () => {
    expect(goneRows([a, b, c], [a, c])).toEqual([{ item: b, index: 1 }])
  })

  test('a row that left goes back in its old place, flagged', () => {
    const rows = mergeLeaving([a, c], [{ item: b, index: 1 }])
    expect(rows.map((row) => [row.item.id, row.isLeaving])).toEqual([
      ['a', false],
      ['b', true],
      ['c', false],
    ])
  })

  test('several leaving rows land back in order, and one that returned is not doubled', () => {
    const rows = mergeLeaving(
      [b],
      [
        { item: c, index: 2 },
        { item: a, index: 0 },
        { item: b, index: 1 },
      ],
    )
    expect(rows.map((row) => row.item.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('nextSelection', () => {
  test('the requested row when it is there', () => {
    expect(nextSelection([a, b, c], 'b', null)).toBe(b)
  })

  test('the row that took its place once it leaves', () => {
    expect(nextSelection([a, c], 'b', { id: 'b', index: 1 })).toBe(c)
    expect(nextSelection([a], 'c', { id: 'c', index: 2 })).toBe(a)
  })

  test('the first row without a request or an anchor for it', () => {
    expect(nextSelection([a, b], undefined, null)).toBe(a)
    expect(nextSelection([a, b], 'gone', { id: 'other', index: 1 })).toBe(a)
    expect(nextSelection([], 'b', { id: 'b', index: 0 })).toBeUndefined()
  })
})

describe('matchesFilter', () => {
  test('alerts have their own filter', () => {
    expect(matchesFilter(item('x', undefined, 'alert'), 'alerts')).toBe(true)
    expect(matchesFilter(item('x', undefined, 'alert'), 'errors')).toBe(false)
    expect(matchesFilter(item('x', undefined, 'log'), 'all')).toBe(true)
  })
})
