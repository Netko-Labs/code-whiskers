import { describe, expect, test } from 'bun:test'
import { cursorFor, dayCounts, levelsAtLeast, throttledFirings } from '../src/alerts'

const NOW = new Date('2026-09-24T06:00:00Z')
const at = (iso: string) => new Date(iso)

describe('cursorFor', () => {
  test('resumes 30s before the last pass, to catch rows committed late', () => {
    expect(cursorFor({ lastEvaluatedAt: '2026-09-24T05:59:00Z' }, NOW)).toEqual(
      at('2026-09-24T05:58:30Z'),
    )
  })

  test('never looks back more than 15 minutes, nor before the first pass', () => {
    expect(cursorFor({ lastEvaluatedAt: '2026-09-23T00:00:00Z' }, NOW)).toEqual(
      at('2026-09-24T05:45:00Z'),
    )
    expect(cursorFor({ lastEvaluatedAt: null }, NOW)).toEqual(at('2026-09-24T05:45:00Z'))
  })
})

describe('levelsAtLeast', () => {
  test('no floor filters nothing', () => {
    expect(levelsAtLeast(null)).toBeNull()
  })

  test('a floor keeps it, everything above, and the Sentry aliases', () => {
    expect(levelsAtLeast('error')?.sort()).toEqual(['critical', 'error', 'fatal'])
    expect(levelsAtLeast('warning')).toContain('warn')
  })
})

describe('throttledFirings', () => {
  const buckets = [
    { key: 'issue-a', at: at('2026-09-24T05:00:00Z') },
    { key: 'issue-a', at: at('2026-09-24T05:10:00Z') },
    { key: 'issue-b', at: at('2026-09-24T05:10:00Z') },
    { key: 'issue-a', at: at('2026-09-24T05:40:00Z') },
  ]

  test('one firing per subject per action interval', () => {
    expect(throttledFirings(buckets, 30)).toEqual([
      at('2026-09-24T05:00:00Z'),
      at('2026-09-24T05:10:00Z'),
      at('2026-09-24T05:40:00Z'),
    ])
  })

  test('a long interval swallows the repeats', () => {
    expect(throttledFirings(buckets, 1440)).toHaveLength(2)
  })
})

describe('dayCounts', () => {
  test('buckets by age, today last, ignoring the future and the too-old', () => {
    const dates = [
      at('2026-09-24T05:00:00Z'),
      at('2026-09-23T07:00:00Z'),
      at('2026-09-23T05:00:00Z'),
      at('2026-09-10T00:00:00Z'),
      at('2026-09-25T00:00:00Z'),
    ]
    expect(dayCounts(dates, NOW, 3)).toEqual([0, 1, 2])
  })
})
