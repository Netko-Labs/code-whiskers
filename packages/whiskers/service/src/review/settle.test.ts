import { describe, expect, test } from 'bun:test'
import type { LlmFinding } from '@code-whiskers/whiskers-domain'
import { isSameFinding, settledVerdict, settleFindings, suppressedFindings } from './settle'
import type { PriorThread } from './types'

function finding(
  file: string,
  line: number | null,
  title: string,
  severity: LlmFinding['severity'] = 'high',
): LlmFinding {
  return { file, line, title, severity, category: 'bug', body: '', suggestion: null }
}

function thread(path: string, line: number, title: string, extra: Partial<PriorThread> = {}) {
  return { path, line, title, isResolved: false, replies: [], ...extra } satisfies PriorThread
}

const BARREL = 'packages/studio/service/src/utils/index.ts'

describe('isSameFinding', () => {
  test('a reworded title on the same file is the same finding', () => {
    expect(
      isSameFinding(finding(BARREL, 6, 'Tenant barrel re-exports the moved resolver module'), {
        file: BARREL,
        line: 6,
        title: 'The tenant barrel still exports the moved resolver',
      }),
    ).toBe(true)
  })

  test('a different problem in the same file is not', () => {
    expect(
      isSameFinding(finding(BARREL, 40, 'Missing await on cache invalidation'), {
        file: BARREL,
        line: 6,
        title: 'The tenant barrel still exports the moved resolver',
      }),
    ).toBe(false)
  })

  test('the same words in another file are not', () => {
    expect(
      isSameFinding(finding('other.ts', 6, 'The tenant barrel still exports the moved resolver'), {
        file: BARREL,
        line: 6,
        title: 'The tenant barrel still exports the moved resolver',
      }),
    ).toBe(false)
  })
})

describe('settleFindings', () => {
  const raised = 'Too-light primary colors can still be saved'

  test('a thread a human answered or resolved is never raised again', () => {
    const answered = thread('a.tsx', 65, raised, {
      replies: [{ author: 'juan', body: 'Intended — the preview warns instead' }],
    })
    const resolved = thread('b.tsx', 10, raised, { isResolved: true })
    const result = settleFindings(
      [
        finding('a.tsx', 66, 'Primary colors that are too light can be saved'),
        finding('b.tsx', 10, raised),
      ],
      [answered, resolved],
      [],
    )
    expect(result.settled).toHaveLength(2)
    expect(result.fresh).toHaveLength(0)
  })

  test('an unanswered thread is a repeat, not a new comment', () => {
    const result = settleFindings([finding('a.tsx', 65, raised)], [thread('a.tsx', 65, raised)], [])
    expect(result.repeated).toHaveLength(1)
  })

  test('a console dismissal settles the reworded finding', () => {
    const suppressed = suppressedFindings([
      { itemKind: 'finding', itemRef: `a.tsx:${raised}`, status: 'dismissed', note: null },
      { itemKind: 'issue', itemRef: 'x', status: 'resolved', note: null },
    ])
    const result = settleFindings(
      [finding('a.tsx', 70, 'Primary colors too light can still be saved')],
      [],
      suppressed,
    )
    expect(suppressed).toHaveLength(1)
    expect(result.settled).toHaveLength(1)
  })

  test('something new stays fresh', () => {
    const result = settleFindings([finding('c.ts', 1, 'Unhandled promise rejection')], [], [])
    expect(result.fresh).toHaveLength(1)
  })
})

describe('settledVerdict', () => {
  test('stops blocking once every blocker is settled', () => {
    expect(settledVerdict('request_changes', [finding('a.ts', 1, 'x', 'medium')])).toBe('comment')
    expect(settledVerdict('request_changes', [finding('a.ts', 1, 'x', 'high')])).toBe(
      'request_changes',
    )
    expect(settledVerdict('approve', [])).toBe('approve')
  })
})
