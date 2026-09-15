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

  test('returns null on truncated JSON instead of buying a doomed retry', async () => {
    expect(await repairReviewText({ text: '{"findings":[{"file":"a.ts"' })).toBeNull()
  })

  test('returns null when the parsed object still fails the schema', async () => {
    expect(await repairReviewText({ text: '```json\n{"findings":"oops"}\n```' })).toBeNull()
  })
})

describe('LlmReviewSchema enums', () => {
  const severityOf = (severity: unknown) =>
    LlmReviewSchema.parse({
      findings: [{ file: 'a.ts', title: 't', severity }],
      verdict: 'approve',
    }).findings[0]?.severity

  test('normalizes casing instead of falling back', () => {
    const parsed = LlmReviewSchema.parse({
      findings: [{ file: 'a.ts', title: 't', severity: 'HIGH', category: ' Security ' }],
      verdict: 'APPROVE',
    })
    expect(parsed.findings[0]?.severity).toBe('high')
    expect(parsed.findings[0]?.category).toBe('security')
    expect(parsed.verdict).toBe('approve')
  })

  test('maps severity synonyms rather than softening them', () => {
    expect(severityOf('blocker')).toBe('critical')
    expect(severityOf('Major')).toBe('high')
    expect(severityOf('nit')).toBe('low')
  })

  test('falls back to medium only on genuinely unknown severities', () => {
    expect(severityOf('spicy')).toBe('medium')
  })
})
