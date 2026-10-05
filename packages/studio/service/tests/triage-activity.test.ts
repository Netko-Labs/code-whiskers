import { describe, expect, test } from 'bun:test'
import type { TriageActivityEntry } from '../src/queries/triage'
import { latestTimeline } from '../src/queries/triage/utils'

const entry = (id: string, minute: number): TriageActivityEntry => ({
  id,
  kind: id.startsWith('c') ? 'commented' : 'resolved',
  actorUserId: null,
  actorName: null,
  actorImage: null,
  data: null,
  body: null,
  createdAt: new Date(Date.UTC(2026, 9, 4, 12, minute)),
})

describe('latestTimeline', () => {
  test('activity and comments interleave oldest first, keeping the newest past the limit', () => {
    const merged = latestTimeline(
      [entry('a1', 1), entry('a3', 3), entry('a5', 5), entry('c2', 2), entry('c4', 4)],
      3,
    )
    expect(merged.map((item) => item.id)).toEqual(['a3', 'c4', 'a5'])
  })
})
