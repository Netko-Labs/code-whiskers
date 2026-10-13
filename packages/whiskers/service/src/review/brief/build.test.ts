import { describe, expect, test } from 'bun:test'
import type { Finding, Review } from '@code-whiskers/whiskers-domain'
import { buildMergeBrief } from './build'
import { BRIEF_MARKER } from './constants'

const review = (id: string, round: number, over: Partial<Review> = {}) =>
  ({
    id,
    headSha: `${id}aaaaaaa`,
    round,
    loopVerdict: 'needs_changes',
    fixedSinceLastRound: [],
    memoryApplied: [],
    ...over,
  }) as Review

const finding = (reviewId: string, fingerprint: string, over: Partial<Finding> = {}) =>
  ({
    reviewId,
    fingerprint,
    file: 'src/otp.ts',
    line: 9,
    severity: 'high',
    title: `Title ${fingerprint}`,
    doneWhen: null,
    threadUrl: null,
    ...over,
  }) as Finding

describe('buildMergeBrief', () => {
  test('nothing to brief before a loop verdict exists', () => {
    expect(buildMergeBrief({ pr: 'a/b#1', reviews: [], findings: [] })).toBeNull()
  })

  test('a mergeable PR lists what the loop fixed and the memory it used', () => {
    const brief = buildMergeBrief({
      pr: 'a/b#1',
      reviews: [
        review('r1', 1),
        review('r2', 2, {
          loopVerdict: 'mergeable',
          fixedSinceLastRound: ['wf_a'],
          memoryApplied: [{ kind: 'rule', body: 'Money is integer cents.' }],
        }),
      ],
      findings: [
        finding('r1', 'wf_a'),
        finding('r2', 'wf_s', { severity: 'low', title: 'Name the constant' }),
      ],
    })
    expect(brief?.verdict).toBe('mergeable')
    expect(brief?.rounds.map((r) => r.fixed)).toEqual([[], ['Title wf_a']])
    expect(brief?.open).toEqual([])
    expect(brief?.markdown).toContain('## Merge brief — Mergeable')
    expect(brief?.markdown).toContain('- round 2: Title wf_a')
    expect(brief?.markdown).toContain('Name the constant')
    expect(brief?.markdown).toContain('(rule) Money is integer cents.')
    expect(brief?.markdown.endsWith(BRIEF_MARKER)).toBe(true)
  })

  test('a handed-over PR says why and what still blocks', () => {
    const brief = buildMergeBrief({
      pr: 'a/b#1',
      reviews: [review('r1', 1), review('r2', 2), review('r3', 3, { loopVerdict: 'needs_human' })],
      findings: [
        finding('r1', 'wf_a'),
        finding('r2', 'wf_a'),
        finding('r3', 'wf_a', { doneWhen: 'verify rejects a foreign contact' }),
      ],
    })
    expect(brief?.humanReason).toBe('stalled')
    expect(brief?.markdown).toContain(
      'Handed over because two pushes in a row left the same blockers',
    )
    expect(brief?.markdown).toContain('done when verify rejects a foreign contact')
  })
})
