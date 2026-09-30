import { describe, expect, test } from 'bun:test'
import type { ScannedComment } from './types'
import { pendingReactions, reactionMarker } from './utils'

const BOT = 'code-whiskers'

function comment(extra: Partial<ScannedComment> & { id: number }): ScannedComment {
  return {
    inReplyToId: null,
    author: 'code-whiskers[bot]',
    path: 'a.ts',
    line: 10,
    body: '**High · bug** — Cursor skips the last page\n\nBody',
    reactions: {},
    ...extra,
  }
}

describe('pendingReactions', () => {
  test('each command reaction on a finding is pending until a bot reply carries its marker', () => {
    const root = comment({ id: 1, reactions: { '-1': 1, rocket: 2, confused: 0 } })
    expect(pendingReactions([root], BOT).map((p) => p.command)).toEqual(['ignore', 'fix'])

    const handled = comment({
      id: 2,
      inReplyToId: 1,
      body: `Fixing — requested by @juan with 🚀.${reactionMarker('rocket')}`,
    })
    expect(pendingReactions([root, handled], BOT).map((p) => p.command)).toEqual(['ignore'])
  })

  test('reactions on human comments or non-finding bot comments are not commands', () => {
    const human = comment({ id: 3, author: 'juan', reactions: { '-1': 1 } })
    const summary = comment({ id: 4, body: 'Reviewing…', reactions: { rocket: 1 } })
    expect(pendingReactions([human, summary], BOT)).toEqual([])
  })

  test('a marker from a human reply does not count as handled', () => {
    const root = comment({ id: 5, reactions: { confused: 1 } })
    const spoof = comment({
      id: 6,
      inReplyToId: 5,
      author: 'juan',
      body: reactionMarker('confused'),
    })
    expect(pendingReactions([root, spoof], BOT)).toHaveLength(1)
  })

  test('a recorded dismissal has handled its 👎 — resolving the thread by hand has not', () => {
    const root = comment({ id: 7, reactions: { '-1': 1, confused: 1 } })
    const recorded = new Set(['a.ts:Cursor skips the last page'])
    expect(pendingReactions([root], BOT, recorded).map((p) => p.command)).toEqual(['explain'])
    expect(pendingReactions([root], BOT, new Set()).map((p) => p.command)).toEqual([
      'ignore',
      'explain',
    ])
  })
})
