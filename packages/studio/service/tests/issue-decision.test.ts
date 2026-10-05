import { describe, expect, test } from 'bun:test'
import {
  issueDecisionOf,
  type LifecycleDecision,
  lifecycleOf,
  recordedIssueIds,
} from '../src/mutations'

const row = (fields: Partial<Parameters<typeof lifecycleOf>[0]>) => ({
  id: 'r',
  scope: 'project:p1',
  itemRef: 'i',
  status: 'open',
  resolveMode: null,
  archiveMode: null,
  archiveValue: null,
  snoozedUntil: null,
  ...fields,
})

describe('issueDecisionOf / lifecycleOf', () => {
  const cases: LifecycleDecision[] = [
    { status: 'unresolved' },
    { status: 'resolved', resolve: { mode: 'now' } },
    { status: 'resolved', resolve: { mode: 'next_release' } },
    { status: 'archived', archive: { mode: 'forever' } },
    { status: 'archived', archive: { mode: 'until', until: new Date('2026-10-21T00:00:00.000Z') } },
    { status: 'archived', archive: { mode: 'events', count: 100 } },
    { status: 'archived', archive: { mode: 'users', count: 10 } },
  ]

  test('what studio remembers is what the sweep pushes again', () => {
    for (const lifecycle of cases) {
      expect(lifecycleOf(row(issueDecisionOf(lifecycle)))).toEqual(lifecycle)
    }
  })

  test('a bare resolve or archive takes the default mode', () => {
    expect(issueDecisionOf({ status: 'resolved' })).toMatchObject({ resolveMode: 'now' })
    expect(issueDecisionOf({ status: 'archived' })).toMatchObject({ archiveMode: 'forever' })
    expect(issueDecisionOf({ status: 'unresolved' })).toEqual({
      status: 'open',
      resolveMode: null,
      archiveMode: null,
      archiveValue: null,
    })
  })

  test('a pre-archive snooze still mirrors, and a mangled value falls back to forever', () => {
    const until = new Date('2026-10-21T00:00:00.000Z')
    expect(lifecycleOf(row({ status: 'snoozed', snoozedUntil: until }))).toEqual({
      status: 'archived',
      archive: { mode: 'until', until },
    })
    expect(
      lifecycleOf(row({ status: 'archived', archiveMode: 'events', archiveValue: 'x' })),
    ).toEqual({ status: 'archived', archive: { mode: 'forever' } })
  })

  test('statuses issues never use have nothing to mirror', () => {
    expect(lifecycleOf(row({ status: 'approved' }))).toBeNull()
  })
})

describe('recordedIssueIds', () => {
  const requested = ['mine', 'theirs', 'gone']

  test('only the ids whiskers found in the authorized project are recorded', () => {
    expect(recordedIssueIds(requested, [{ id: 'mine' }])).toEqual(['mine'])
    expect(recordedIssueIds(requested, [])).toEqual([])
  })

  test('whiskers unreachable: the selection is recorded under its scope, unchecked', () => {
    expect(recordedIssueIds(requested, null)).toEqual(requested)
  })
})
