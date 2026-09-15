import { describe, expect, test } from 'bun:test'
import { LlmReviewSchema } from '@code-whiskers/whiskers-domain'
import { repairReviewText } from './repair'

describe('repairReviewText', () => {
  test('drops findings without file or title, keeps the rest', async () => {
    const text = JSON.stringify({
      findings: [{ file: 'a.ts', title: 'ok' }, { title: 'no file' }, { file: 'b.ts' }],
      verdict: 'approve',
    })
    const repaired = await repairReviewText({ text })
    const parsed = LlmReviewSchema.parse(JSON.parse(repaired ?? ''))
    expect(parsed.findings.map((f) => f.file)).toEqual(['a.ts'])
    expect(parsed.summary).toBe('')
    expect(parsed.findings[0]?.body).toBe('')
  })

  test('unfences before repairing', async () => {
    const repaired = await repairReviewText({
      text: '```json\n{"findings":[],"verdict":"approve"}\n```',
    })
    expect(repaired).toBe('{"findings":[],"verdict":"approve"}')
  })

  test('returns null when nothing changes', async () => {
    expect(await repairReviewText({ text: '{"findings":[],"verdict":"approve"}' })).toBeNull()
  })
})

describe('LlmReviewSchema enums', () => {
  const withFinding = (severity: unknown, category: unknown) =>
    LlmReviewSchema.parse({
      findings: [{ file: 'a.ts', title: 't', severity, category }],
      verdict: 'APPROVE',
    })

  test('normalizes casing instead of falling back', () => {
    const parsed = withFinding('HIGH', ' Security ')
    expect(parsed.findings[0]?.severity).toBe('high')
    expect(parsed.findings[0]?.category).toBe('security')
    expect(parsed.verdict).toBe('approve')
  })

  test('falls back only on genuinely unknown values', () => {
    const parsed = withFinding('spicy', 'vibes')
    expect(parsed.findings[0]?.severity).toBe('medium')
    expect(parsed.findings[0]?.category).toBe('bug')
  })
})
