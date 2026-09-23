import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test'
import type { LlmFinding, LlmReview } from '@code-whiskers/whiskers-domain'
import { chunkDiff } from '../src/review/chunk'
import * as llm from '../src/review/llm'
import { resolveOutcome, reviewChunkWithRetry } from '../src/review/outcome'
import { createTokenTally } from '../src/shared/llm'

const section = (file: string) => `diff --git a/${file} b/${file}\n+${'x'.repeat(40)}\n`
const TWO_FILES = section('ok.ts') + section('bad.ts')
const FOUR_FILES = section('ok1.ts') + section('ok2.ts') + section('ok3.ts') + section('bad.ts')

const finding: LlmFinding = {
  file: 'ok.ts',
  line: 1,
  severity: 'low',
  category: 'bug',
  title: 'a finding',
  body: 'details',
  suggestion: null,
}
const review: LlmReview = { findings: [finding], summary: 'reviewed', verdict: 'approve' }
const timeout = Object.assign(new Error('The operation timed out.'), { name: 'TimeoutError' })

/** Chunks with more than one file time out; any single-file chunk naming `bad.ts` fails for good. */
function mockReviewChunk() {
  return spyOn(llm, 'reviewChunk').mockImplementation(async (chunk) => {
    if (chunk.split('diff --git ').length > 2) throw timeout
    if (chunk.includes('bad.ts')) throw new Error('400 invalid request')
    return review
  })
}

afterEach(() => {
  mock.restore()
})

describe('reviewChunkWithRetry', () => {
  test('a clean chunk counts as one reviewed section', async () => {
    mockReviewChunk()
    const outcome = await reviewChunkWithRetry(section('ok.ts'), '', createTokenTally())
    expect(outcome).toEqual({ review, reviewed: 1, attempted: 1 })
  })

  test('a permanent failure counts as one skipped section', async () => {
    mockReviewChunk()
    const outcome = await reviewChunkWithRetry(section('bad.ts'), '', createTokenTally())
    expect(outcome).toEqual({ review: null, reviewed: 0, attempted: 1 })
  })

  test('a split whose second half fails reports the gap', async () => {
    mockReviewChunk()
    const outcome = await reviewChunkWithRetry(TWO_FILES, '', createTokenTally())
    expect(outcome.review?.findings).toEqual([finding])
    expect(outcome.reviewed).toBe(1)
    expect(outcome.attempted).toBe(2)
  })

  test('nested splits count every leaf', async () => {
    const spy = mockReviewChunk()
    const outcome = await reviewChunkWithRetry(FOUR_FILES, '', createTokenTally())
    expect(outcome.reviewed).toBe(3)
    expect(outcome.attempted).toBe(4)
    expect(outcome.review?.findings).toHaveLength(3)
    expect(spy).toHaveBeenCalledTimes(7)
  })
})

describe('resolveOutcome', () => {
  test('no chunks approves with nothing reviewable', () => {
    const { review, coverage } = resolveOutcome([])
    expect(review.verdict).toBe('approve')
    expect(review.findings).toEqual([])
    expect(review.summary).toStartWith('Nothing reviewable changed')
    expect(coverage).toEqual({ reviewed: 0, total: 0 })
  })

  test('a lockfile-only diff chunks to nothing', () => {
    const diff =
      'diff --git a/bun.lock b/bun.lock\n--- a/bun.lock\n+++ b/bun.lock\n@@ -1 +1 @@\n-a\n+b\n'
    expect(chunkDiff(diff)).toEqual([])
  })

  test('coverage sums leaf sections across chunks', () => {
    const { coverage } = resolveOutcome([
      { review, reviewed: 1, attempted: 2 },
      { review, reviewed: 1, attempted: 1 },
    ])
    expect(coverage).toEqual({ reviewed: 2, total: 3 })
  })

  test('every section failing still throws', () => {
    expect(() =>
      resolveOutcome([
        { review: null, reviewed: 0, attempted: 2 },
        { review: null, reviewed: 0, attempted: 1 },
      ]),
    ).toThrow('all 3 diff sections failed to review')
  })
})
