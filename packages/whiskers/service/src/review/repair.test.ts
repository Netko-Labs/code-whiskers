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
